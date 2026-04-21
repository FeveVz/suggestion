#!/usr/bin/env python3
"""
Extract service details from all 16 SUGGESTION service page JSON files.
Parses HTML content to extract: service name, description, plans/packages,
methodology phases, and features/deliverables.
"""

import json
import re
import os
from bs4 import BeautifulSoup

SERVICES = [
    "suggestion-svc-marketing-digital",
    "suggestion-svc-marketing-redes-sociales",
    "suggestion-svc-publicidad-digital",
    "suggestion-svc-seo-posicionamiento",
    "suggestion-svc-branding-diseno",
    "suggestion-svc-desarrollo-web",
    "suggestion-svc-consultoria-marketing",
    "suggestion-svc-crm-automatizacion",
    "suggestion-svc-produccion-audiovisual",
    "suggestion-svc-investigacion-mercado",
    "suggestion-svc-merchandising",
    "suggestion-svc-imprenta-corporativa",
    "suggestion-svc-estructuras-publicitarias",
    "suggestion-svc-publicidad-movil",
    "suggestion-svc-btl-activaciones",
    "suggestion-svc-material-pop",
]

BASE_DIR = "/home/z/my-project"

def clean_text(text):
    """Clean up text by removing extra whitespace and normalizing."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_title(soup):
    """Extract service title from h1 tag."""
    h1 = soup.find('h1')
    if h1:
        return clean_text(h1.get_text())
    return ""

def extract_subtitle_label(soup):
    """Extract the small uppercase label near the hero (e.g., 'Marketing Digital', 'Branding')."""
    # Look for the span with tracking-wider uppercase class
    for span in soup.find_all('span', class_=lambda c: c and 'tracking-wider' in c):
        text = clean_text(span.get_text())
        if text and text == text.upper() and len(text) < 50:
            return text
    return ""

def extract_hero_description(soup):
    """Extract the main paragraph description from hero section."""
    # The hero p tag with the main description
    h1 = soup.find('h1')
    if h1:
        parent = h1.find_parent()
        if parent:
            p = parent.find('p')
            if p:
                return clean_text(p.get_text())
    return ""

def extract_features_includes(soup):
    """Extract features from 'Qué incluye' section - cards with circle-check-big icons."""
    features = []
    # Find the "Qué incluye" section
    for h2 in soup.find_all('h2'):
        h2_text = clean_text(h2.get_text())
        if 'incluye' in h2_text.lower():
            # Get the parent section
            section = h2.find_parent('section')
            if not section:
                section = h2.find_parent('div')
            if section:
                # Find all h3 tags within this section
                for h3 in section.find_all('h3'):
                    h3_text = clean_text(h3.get_text())
                    if h3_text and 'incluye' not in h3_text.lower():
                        # Get the description from the sibling p tag
                        p = h3.find_next_sibling('p')
                        if not p:
                            # Try parent card-content approach
                            parent = h3.find_parent()
                            if parent:
                                p = parent.find('p')
                        desc = clean_text(p.get_text()) if p else ""
                        features.append({"name": h3_text, "description": desc})
    return features

def extract_why_choose(soup):
    """Extract 'Por qué elegir' benefits."""
    benefits = []
    for h2 in soup.find_all('h2'):
        h2_text = clean_text(h2.get_text())
        if 'elegir' in h2_text.lower() or 'por qué' in h2_text.lower():
            section = h2.find_parent('section')
            if not section:
                section = h2.find_parent('div')
            if section:
                for h3 in section.find_all('h3'):
                    h3_text = clean_text(h3.get_text())
                    if h3_text and 'elegir' not in h3_text.lower():
                        p = h3.find_next_sibling('p')
                        if not p:
                            parent = h3.find_parent()
                            if parent:
                                p = parent.find('p')
                        desc = clean_text(p.get_text()) if p else ""
                        benefits.append({"name": h3_text, "description": desc})
    return benefits

def extract_methodology(soup):
    """Extract methodology phases from 'Nuestro proceso' section."""
    phases = []
    for h2 in soup.find_all('h2'):
        h2_text = clean_text(h2.get_text())
        if 'proceso' in h2_text.lower() or 'metodolog' in h2_text.lower():
            section = h2.find_parent('section')
            if not section:
                continue
            # Find all h3 within this section
            for h3 in section.find_all('h3'):
                h3_text = clean_text(h3.get_text())
                if h3_text and 'proceso' not in h3_text.lower():
                    p = h3.find_next_sibling('p')
                    if not p:
                        parent = h3.find_parent()
                        if parent:
                            p = parent.find('p')
                    desc = clean_text(p.get_text()) if p else ""
                    phases.append({"name": h3_text, "description": desc})
    return phases

def extract_plans(soup):
    """Extract plan/pricing information from the pricing section."""
    plans = []
    
    # Find the pricing/plans section - look for section with "Plan" in headings or content
    # The plans are usually in a section after the methodology
    
    # Strategy: look for elements that contain plan names like "Emprendedor", "Profesional", "Corporativo"
    # or "Básico", "Premium" etc.
    
    # Find all sections
    for section in soup.find_all('section'):
        section_text = section.get_text()
        
        # Check if this section contains plan-like content
        plan_keywords = ['Emprendedor', 'Profesional', 'Corporativo', 'Básico', 'Premium',
                        'Plan', 'S/.' , 'USD', 'precio', 'mensual', 'Desde S/', 'S/ ']
        
        has_plan_keyword = any(kw in section_text for kw in plan_keywords)
        
        if not has_plan_keyword:
            continue
        
        # Look for plan names in h3 or h4 tags
        plan_headers = section.find_all(['h3', 'h4'])
        
        for header in plan_headers:
            header_text = clean_text(header.get_text())
            
            # Check if this looks like a plan name
            plan_name_patterns = ['Emprendedor', 'Profesional', 'Corporativo', 'Básico', 
                                 'Premium', 'Plan', 'Starter', 'Business', 'Enterprise']
            
            is_plan_name = any(p.lower() in header_text.lower() for p in plan_name_patterns)
            
            if is_plan_name:
                plan = {"name": header_text, "price": "", "includes": []}
                
                # Look for price - usually in the same card/parent
                parent = header.find_parent()
                # Go up a few levels to find the card container
                for _ in range(5):
                    if parent:
                        parent = parent.find_parent()
                
                if parent:
                    # Look for price patterns
                    price_elements = parent.find_all(string=re.compile(r'S/\s*[\d,]+|USD\s*[\d,]+|\$[\d,]+|Desde'))
                    for price_el in price_elements:
                        price_text = clean_text(price_el)
                        if 'S/' in price_text or 'USD' in price_text or '$' in price_text:
                            plan["price"] = price_text
                            break
                    
                    # Also look for price in divs with specific styling
                    for div in parent.find_all('div'):
                        div_text = clean_text(div.get_text())
                        if re.search(r'S/\s*[\d,]+', div_text) and len(div_text) < 30:
                            plan["price"] = div_text
                            break
                    
                    # Look for included items (usually list items or check items)
                    for li in parent.find_all('li'):
                        li_text = clean_text(li.get_text())
                        if li_text:
                            plan["includes"].append(li_text)
                    
                    # Also look for items with checkmark SVGs
                    for item_div in parent.find_all('div'):
                        # Check if this div contains a checkmark icon
                        svg = item_div.find('svg', class_=lambda c: c and 'check' in str(c).lower())
                        if not svg:
                            # Also check for lucide-check or circle-check
                            svg_tags = item_div.find_all('svg')
                            for s in svg_tags:
                                paths = s.find_all('path')
                                for p in paths:
                                    if 'check' in str(p).lower():
                                        svg = s
                                        break
                        
                        if svg:
                            item_text = clean_text(item_div.get_text())
                            if item_text and len(item_text) < 100 and item_text not in plan["includes"]:
                                plan["includes"].append(item_text)
                
                if plan["name"]:
                    plans.append(plan)
    
    return plans

def extract_stats(soup):
    """Extract stats from the hero section (like 250%, 3x, etc.)."""
    stats = []
    h1 = soup.find('h1')
    if h1:
        parent = h1.find_parent()
        # Go up to find the grid with stats
        for _ in range(5):
            if parent:
                parent = parent.find_parent()
        
        if parent:
            # Look for divs with large bold numbers
            for div in parent.find_all('div', class_=lambda c: c and 'font-bold' in str(c)):
                text = clean_text(div.get_text())
                if text and any(c.isdigit() for c in text) and len(text) < 20:
                    # Find the label below/next to it
                    label_div = div.find_next_sibling('div')
                    if label_div:
                        label = clean_text(label_div.get_text())
                        stats.append({"value": text, "label": label})
    return stats

def extract_contact_section(soup):
    """Extract any contact/CTA section details."""
    for section in soup.find_all('section'):
        section_text = clean_text(section.get_text())
        if 'contacto' in section_text.lower()[:100] or 'hablemos' in section_text.lower()[:100]:
            return section_text[:500]
    return ""

def extract_service_data(filename):
    """Extract all data from a single service JSON file."""
    filepath = os.path.join(BASE_DIR, f"{filename}.json")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        return {"error": f"File not found: {filepath}"}
    except json.JSONDecodeError as e:
        return {"error": f"JSON parse error: {e}"}
    
    html_content = data.get("data", {}).get("html", "")
    meta_description = data.get("data", {}).get("description", "")
    title_tag = data.get("data", {}).get("title", "")
    
    soup = BeautifulSoup(html_content, 'lxml')
    
    result = {
        "filename": filename,
        "title_tag": title_tag,
        "meta_description": meta_description,
        "service_label": extract_subtitle_label(soup),
        "h1_title": extract_title(soup),
        "hero_description": extract_hero_description(soup),
        "features": extract_features_includes(soup),
        "why_choose": extract_why_choose(soup),
        "methodology": extract_methodology(soup),
        "plans": extract_plans(soup),
        "stats": extract_stats(soup),
    }
    
    return result

def main():
    all_services = {}
    
    for svc in SERVICES:
        print(f"Processing: {svc}...")
        result = extract_service_data(svc)
        all_services[svc] = result
    
    # Save full results as JSON
    output_path = os.path.join(BASE_DIR, "extracted_services_full.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_services, f, ensure_ascii=False, indent=2)
    print(f"\nFull results saved to: {output_path}")
    
    # Print summary
    print("\n" + "="*80)
    print("SUMMARY OF ALL 16 SERVICES")
    print("="*80)
    
    for svc in SERVICES:
        result = all_services[svc]
        if "error" in result:
            print(f"\n❌ {svc}: {result['error']}")
            continue
        
        print(f"\n{'─'*80}")
        print(f"SERVICE: {result.get('service_label', 'N/A')}")
        print(f"  H1 Title: {result.get('h1_title', 'N/A')}")
        print(f"  Meta Description: {result.get('meta_description', 'N/A')[:120]}...")
        print(f"  Hero Description: {result.get('hero_description', 'N/A')[:120]}...")
        
        print(f"  Features ({len(result.get('features', []))}):")
        for feat in result.get('features', []):
            print(f"    • {feat['name']}: {feat['description'][:80]}")
        
        print(f"  Why Choose ({len(result.get('why_choose', []))}):")
        for wc in result.get('why_choose', []):
            print(f"    • {wc['name']}: {wc['description'][:80]}")
        
        print(f"  Methodology ({len(result.get('methodology', []))}):")
        for phase in result.get('methodology', []):
            print(f"    • {phase['name']}: {phase['description'][:80]}")
        
        print(f"  Plans ({len(result.get('plans', []))}):")
        for plan in result.get('plans', []):
            print(f"    • {plan['name']} - Price: {plan.get('price', 'N/A')}")
            for inc in plan.get('includes', [])[:5]:
                print(f"      - {inc[:80]}")
        
        stats = result.get('stats', [])
        if stats:
            print(f"  Stats:")
            for stat in stats:
                print(f"    • {stat['value']} - {stat['label']}")

if __name__ == "__main__":
    main()
