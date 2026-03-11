"""API collector for PubMed (Entrez) and SEC EDGAR full-text search."""

import asyncio
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import quote

import httpx

from collectors.base import BaseCollector, RawContentCreate

logger = logging.getLogger(__name__)

# PubMed Entrez base URLs
ENTREZ_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
ENTREZ_FETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

# SEC EDGAR full-text search
EDGAR_FULLTEXT_URL = "https://efts.sec.gov/LATEST/search-index"
EDGAR_SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{cik}.json"

# CIK numbers for tracked companies
EDGAR_CIKS = {
    "Conagra": "0000023217",
    "Kraft Heinz": "0001637459",
    "Hormel": "0000048102",
    "Smucker": "0000091419",
    "Mondelez": "0001103982",
    "Campbells": "0000016160",
}


class APICollector(BaseCollector):
    """
    Collector for structured APIs.
    Dispatches to PubMed or SEC EDGAR based on source config_json['api_type'].
    """

    async def collect(self) -> list[RawContentCreate]:
        api_type = self.source.config_json.get("api_type", "")

        if api_type == "pubmed":
            return await self._collect_pubmed()
        elif api_type == "sec_edgar":
            return await self._collect_edgar()
        else:
            logger.error("Unknown API type for source %s: %s", self.source.id, api_type)
            return []

    # ─── PubMed ──────────────────────────────────────────────────────────────

    async def _collect_pubmed(self) -> list[RawContentCreate]:
        """Fetch recent PubMed articles for configured keywords."""
        keywords = self.source.config_json.get(
            "keywords",
            ["protein fortification", "food fiber", "GLP-1 food", "clean label", "precision fermentation"],
        )
        days_back = self.source.config_json.get("days_back", 7)

        items = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            for keyword in keywords:
                try:
                    # Search for PMIDs
                    search_resp = await client.get(
                        ENTREZ_SEARCH_URL,
                        params={
                            "db": "pubmed",
                            "term": f'{keyword}[Title/Abstract]',
                            "retmax": 10,
                            "sort": "pub_date",
                            "reldate": days_back,
                            "datetype": "pdat",
                            "retmode": "json",
                        },
                    )
                    search_resp.raise_for_status()
                    pmids = search_resp.json().get("esearchresult", {}).get("idlist", [])

                    if not pmids:
                        continue

                    # Fetch abstracts
                    fetch_resp = await client.get(
                        ENTREZ_FETCH_URL,
                        params={
                            "db": "pubmed",
                            "id": ",".join(pmids),
                            "rettype": "abstract",
                            "retmode": "xml",
                        },
                    )
                    fetch_resp.raise_for_status()

                    articles = self._parse_pubmed_xml(fetch_resp.text, keyword)
                    items.extend(articles)

                    # Respect PubMed rate limit: max 3 req/second without API key
                    await asyncio.sleep(0.4)

                except Exception as exc:
                    logger.error("PubMed collection failed for keyword '%s': %s", keyword, exc)
                    continue

        if items:
            await self.mark_source_healthy()
        return self.deduplicate_locally(items)

    def _parse_pubmed_xml(self, xml_text: str, keyword: str) -> list[RawContentCreate]:
        """Parse PubMed XML response into RawContentCreate objects."""
        items = []
        try:
            root = ET.fromstring(xml_text)
            for article in root.findall(".//PubmedArticle"):
                try:
                    pmid_el = article.find(".//PMID")
                    pmid = pmid_el.text if pmid_el is not None else "unknown"
                    url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

                    title_el = article.find(".//ArticleTitle")
                    title = title_el.text or "" if title_el is not None else ""

                    # Concatenate abstract text sections
                    abstract_texts = article.findall(".//AbstractText")
                    abstract = " ".join(
                        (el.text or "") for el in abstract_texts if el.text
                    )

                    if not abstract:
                        continue

                    # Parse date
                    pub_date = None
                    date_el = article.find(".//PubDate")
                    if date_el is not None:
                        year_el = date_el.find("Year")
                        month_el = date_el.find("Month")
                        if year_el is not None:
                            try:
                                year = int(year_el.text)
                                month = 1
                                if month_el is not None:
                                    from datetime import datetime as dt
                                    try:
                                        month = dt.strptime(month_el.text, "%b").month
                                    except ValueError:
                                        try:
                                            month = int(month_el.text)
                                        except ValueError:
                                            pass
                                pub_date = datetime(year, month, 1, tzinfo=timezone.utc)
                            except (ValueError, TypeError):
                                pass

                    journal_el = article.find(".//Journal/Title")
                    journal = journal_el.text if journal_el is not None else ""

                    items.append(RawContentCreate(
                        source_id=self.source.id,
                        url=url,
                        title=title,
                        body=f"{title}\n\n{abstract}",
                        published_at=pub_date,
                        metadata={
                            "pmid": pmid,
                            "journal": journal,
                            "search_keyword": keyword,
                            "source": "pubmed",
                        },
                    ))
                except Exception as exc:
                    logger.warning("Skipping malformed PubMed article: %s", exc)
                    continue
        except ET.ParseError as exc:
            logger.error("Failed to parse PubMed XML: %s", exc)

        return items

    # ─── SEC EDGAR ───────────────────────────────────────────────────────────

    async def _collect_edgar(self) -> list[RawContentCreate]:
        """Fetch recent 8-K filings from SEC EDGAR for tracked companies."""
        company_name = self.source.config_json.get("company")
        cik = self.source.config_json.get("cik") or EDGAR_CIKS.get(company_name)

        if not cik:
            logger.error("No CIK configured for EDGAR source %s", self.source.id)
            return []

        # Zero-pad CIK to 10 digits
        cik_padded = str(cik).zfill(10)

        items = []
        try:
            async with httpx.AsyncClient(
                timeout=30.0,
                headers={"User-Agent": "SCOUT/1.0 contact@generalmills.com"},
            ) as client:
                resp = await client.get(
                    EDGAR_SUBMISSIONS_URL.format(cik=cik_padded)
                )
                resp.raise_for_status()
                data = resp.json()

            filings = data.get("filings", {}).get("recent", {})
            forms = filings.get("form", [])
            dates = filings.get("filingDate", [])
            accessions = filings.get("accessionNumber", [])
            descriptions = filings.get("primaryDocument", [])

            company_display = data.get("name", company_name or "Unknown")

            for i, form in enumerate(forms):
                if form not in ("8-K", "8-K/A"):
                    continue

                filing_date_str = dates[i] if i < len(dates) else None
                accession = accessions[i] if i < len(accessions) else None
                primary_doc = descriptions[i] if i < len(descriptions) else None

                if not accession:
                    continue

                # Parse filing date
                pub_date = None
                if filing_date_str:
                    try:
                        pub_date = datetime.strptime(filing_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                    except ValueError:
                        pass

                # Build Edgar URL
                acc_no_dashes = accession.replace("-", "")
                filing_url = f"https://www.sec.gov/Archives/edgar/data/{int(cik_padded)}/{acc_no_dashes}/{primary_doc}"
                index_url = f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik_padded}&type=8-K&dateb=&owner=include&count=10"

                body = (
                    f"SEC 8-K Filing: {company_display}\n"
                    f"Filing Date: {filing_date_str}\n"
                    f"Accession Number: {accession}\n"
                    f"Form Type: {form}\n"
                    f"Filing URL: {filing_url}"
                )

                items.append(RawContentCreate(
                    source_id=self.source.id,
                    url=filing_url,
                    title=f"{company_display} 8-K Filing — {filing_date_str}",
                    body=body,
                    published_at=pub_date,
                    metadata={
                        "form_type": form,
                        "accession_number": accession,
                        "company": company_display,
                        "cik": cik,
                        "source": "sec_edgar",
                    },
                ))

                # Limit to 10 most recent 8-Ks
                if len(items) >= 10:
                    break

        except Exception as exc:
            logger.error("EDGAR collection failed for CIK %s: %s", cik, exc)
            await self.mark_source_failure()
            return []

        await self.mark_source_healthy()
        return self.deduplicate_locally(items)
