#!/usr/bin/env python3
"""
COMPREHENSIVE extraction of service details from all 16 SUGGESTION service page JSON files.
Parses HTML content with BeautifulSoup to extract structured plan data.
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
    """Clean up text by removing extra whitespace."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_plans_detailed(soup):
    """Extract plan/pricing information with detailed structure."""
    plans = []
    
    # Find all h3 tags that look like plan names
    plan_name_patterns = ['Starter', 'Business', 'Premium', 'Enterprise', 'Básico', 
                          'Profesional', 'Corporativo', 'Emprendedor', 'Plan']
    
    for h3 in soup.find_all('h3'):
        h3_text = clean_text(h3.get_text())
        
        # Check if this is a plan name
        is_plan = any(p.lower() in h3_text.lower() for p in plan_name_patterns)
        
        # Also check if near a price
        if not is_plan:
            parent_text = ""
            p = h3
            for _ in range(5):
                p = p.find_parent()
                if p:
                    parent_text = p.get_text()[:300]
            if 'S/' in parent_text and ('mes' in parent_text or 'proyecto' in parent_text or 'día' in parent_text):
                is_plan = True
        
        if not is_plan:
            continue
        
        plan = {
            "name": h3_text,
            "original_price": "",
            "discount": "",
            "current_price": "",
            "period": "",
            "includes": []
        }
        
        # Navigate up to find the card container
        card = h3
        for _ in range(10):
            card = card.find_parent()
            if not card:
                break
            card_text = card.get_text()
            # We want the container that has the price and list items
            if ('S/' in card_text or 'USD' in card_text) and len(card.find_all('li')) >= 3:
                break
        
        if not card:
            continue
        
        # Extract original price (line-through)
        orig_price = card.find('span', class_=lambda c: c and 'line-through' in str(c))
        if orig_price:
            plan["original_price"] = clean_text(orig_price.get_text())
        
        # Extract discount badge
        discount = card.find('span', class_=lambda c: c and 'rounded-full' in str(c) and 'emerald' in str(c))
        if discount:
            plan["discount"] = clean_text(discount.get_text())
        
        # Extract current price and period
        # Look for the price display pattern: big number + /mes or /proyecto etc.
        for span in card.find_all('span'):
            span_text = clean_text(span.get_text())
            # Look for period indicators
            if any(p in span_text.lower() for p in ['mes', 'proyecto', 'día', 'dia', 'semana', 'año', 'unico', 'único']):
                # The previous sibling likely has the price
                prev = span.find_previous_sibling()
                if prev:
                    price_text = clean_text(prev.get_text())
                    if 'S/' in price_text or '$' in price_text or 'USD' in price_text or price_text.replace(',','').replace('.','').isdigit():
                        plan["current_price"] = price_text
                plan["period"] = span_text
                break
        
        # If no period found, try to extract from card text
        if not plan["current_price"]:
            # Alternative: look for the price in a div with large font
            for div in card.find_all('div'):
                div_text = clean_text(div.get_text())
                if re.search(r'S/\s*[\d,]+', div_text) and len(div_text) < 50:
                    plan["current_price"] = div_text
                    break
        
        # Extract list items
        for li in card.find_all('li'):
            li_text = clean_text(li.get_text())
            if li_text and li_text != h3_text:
                plan["includes"].append(li_text)
        
        # If no li items found, look for div-based items with check icons
        if len(plan["includes"]) < 3:
            plan["includes"] = []
            for div in card.find_all('div', class_=lambda c: c and 'flex' in str(c)):
                div_text = clean_text(div.get_text())
                svg = div.find('svg')
                # Check for check-like SVGs
                if svg and len(div_text) < 100:
                    # Make sure it's an include item, not the plan name or price
                    if ('S/' not in div_text and h3_text not in div_text and 
                        'Starter' not in div_text and 'Business' not in div_text and
                        'Premium' not in div_text and 'Enterprise' not in div_text and
                        'Básico' not in div_text and 'Profesional' not in div_text):
                        plan["includes"].append(div_text)
        
        # Only add if we have meaningful data
        if plan["includes"] or plan["current_price"]:
            plans.append(plan)
    
    return plans

def extract_service_label(soup):
    """Extract the small uppercase label near the hero."""
    for span in soup.find_all('span', class_=lambda c: c and 'tracking-wider' in c):
        text = clean_text(span.get_text())
        if text and len(text) < 50:
            return text
    return ""

def extract_hero_description(soup):
    """Extract main paragraph from hero."""
    h1 = soup.find('h1')
    if h1:
        parent = h1.find_parent()
        if parent:
            for p in parent.find_all('p'):
                p_text = clean_text(p.get_text())
                if len(p_text) > 50:  # The main description is longer
                    return p_text
    return ""

def extract_features(soup):
    """Extract features from 'Qué incluye' section."""
    features = []
    for h2 in soup.find_all('h2'):
        h2_text = clean_text(h2.get_text())
        if 'incluye' in h2_text.lower():
            section = h2.find_parent('section')
            if not section:
                section = h2.find_parent('div')
            if section:
                for h3 in section.find_all('h3'):
                    h3_text = clean_text(h3.get_text())
                    if h3_text and 'incluye' not in h3_text.lower() and 'Starter' not in h3_text and 'Business' not in h3_text and 'Premium' not in h3_text and 'Enterprise' not in h3_text and 'Plan' not in h3_text:
                        p = h3.find_next_sibling('p')
                        if not p:
                            parent = h3.find_parent()
                            if parent:
                                p = parent.find('p')
                        desc = clean_text(p.get_text()) if p else ""
                        features.append({"name": h3_text, "description": desc})
    return features

def extract_methodology(soup):
    """Extract methodology phases from 'Nuestro proceso' section."""
    phases = []
    for h2 in soup.find_all('h2'):
        h2_text = clean_text(h2.get_text())
        if 'proceso' in h2_text.lower() or 'metodolog' in h2_text.lower():
            section = h2.find_parent('section')
            if not section:
                continue
            for h3 in section.find_all('h3'):
                h3_text = clean_text(h3.get_text())
                if h3_text and 'proceso' not in h3_text.lower() and 'metodolog' not in h3_text.lower():
                    p = h3.find_next_sibling('p')
                    if not p:
                        parent = h3.find_parent()
                        if parent:
                            p = parent.find('p')
                    desc = clean_text(p.get_text()) if p else ""
                    phases.append({"name": h3_text, "description": desc})
    return phases

def extract_why_choose(soup):
    """Extract 'Por qué elegir' section."""
    benefits = []
    for h2 in soup.find_all('h2'):
        h2_text = clean_text(h2.get_text())
        if 'elegir' in h2_text.lower():
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

def extract_stats(soup):
    """Extract stats from the hero section."""
    stats = []
    h1 = soup.find('h1')
    if h1:
        # Go up to find the stats grid
        parent = h1
        for _ in range(8):
            if parent:
                parent = parent.find_parent()
        
        if parent:
            # Find all divs with font-bold that contain numbers
            for div in parent.find_all('div', class_=lambda c: c and 'font-bold' in str(c)):
                text = clean_text(div.get_text())
                if text and any(c.isdigit() for c in text) and len(text) < 20 and '%' in text or 'x' in text.lower() or '+' in text or '<' in text:
                    # Find the label
                    label_div = div.find_next_sibling('div')
                    if label_div:
                        label = clean_text(label_div.get_text())
                        if label and 'Paso' not in label:
                            stats.append({"value": text, "label": label})
    return stats

def process_service(filename):
    """Process a single service JSON file."""
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
    
    h1 = soup.find('h1')
    h1_text = clean_text(h1.get_text()) if h1 else ""
    
    return {
        "filename": filename,
        "title_tag": title_tag,
        "meta_description": meta_description,
        "service_label": extract_service_label(soup),
        "h1_title": h1_text,
        "hero_description": extract_hero_description(soup),
        "features": extract_features(soup),
        "why_choose": extract_why_choose(soup),
        "methodology": extract_methodology(soup),
        "plans": extract_plans_detailed(soup),
        "stats": extract_stats(soup),
    }

def main():
    all_services = {}
    
    for svc in SERVICES:
        print(f"Processing: {svc}...")
        result = process_service(svc)
        all_services[svc] = result
    
    # Save full results as JSON
    output_path = os.path.join(BASE_DIR, "extracted_services_complete.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_services, f, ensure_ascii=False, indent=2)
    print(f"\nFull results saved to: {output_path}")
    
    # Print detailed summary
    print("\n" + "="*100)
    print("COMPLETE EXTRACTION SUMMARY - ALL 16 SERVICES")
    print("="*100)
    
    for svc in SERVICES:
        r = all_services[svc]
        if "error" in r:
            print(f"\n❌ {svc}: {r['error']}")
            continue
        
        print(f"\n{'━'*100}")
        print(f"📋 SERVICE: {r.get('service_label', 'N/A')}")
        print(f"   H1: {r.get('h1_title', 'N/A')}")
        print(f"   Meta: {r.get('meta_description', 'N/A')[:150]}")
        print(f"   Hero: {r.get('hero_description', 'N/A')[:150]}")
        
        features = r.get('features', [])
        if features:
            print(f"\n   ✅ FEATURES ({len(features)}):")
            for f in features:
                print(f"      • {f['name']}: {f['description'][:100]}")
        
        why = r.get('why_choose', [])
        if why:
            print(f"\n   🎯 WHY CHOOSE ({len(why)}):")
            for w in why:
                print(f"      • {w['name']}: {w['description'][:100]}")
        
        method = r.get('methodology', [])
        if method:
            print(f"\n   🔄 METHODOLOGY ({len(method)} phases):")
            for i, m in enumerate(method, 1):
                print(f"      {i}. {m['name']}: {m['description'][:100]}")
        
        plans = r.get('plans', [])
        if plans:
            print(f"\n   💰 PLANS ({len(plans)}):")
            for p in plans:
                print(f"      ┌─ {p['name']}")
                print(f"      │  Original: {p.get('original_price', 'N/A')}")
                print(f"      │  Discount: {p.get('discount', 'N/A')}")
                print(f"      │  Current:  {p.get('current_price', 'N/A')} {p.get('period', '')}")
                if p.get('includes'):
                    print(f"      │  Includes:")
                    for inc in p['includes']:
                        print(f"      │    ✓ {inc[:100]}")
                print(f"      └─")
        else:
            print(f"\n   💰 PLANS: No structured plans found")

if __name__ == "__main__":
    main()
