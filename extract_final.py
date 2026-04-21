#!/usr/bin/env python3
"""
FINAL comprehensive extraction of service details from all 16 SUGGESTION service pages.
Produces clean structured JSON for the proforma generator app.
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

# Known plan name patterns (ordered by priority)
PLAN_NAMES = ['Starter', 'Business', 'Premium', 'Enterprise', 'Básico', 
              'Profesional', 'Corporativo', 'Emprendedor', 'Pro']

# Feature/category headers that are NOT plan names
NON_PLAN_NAMES = ['Eventos Corporativos', 'Planificación', 'Calidad Profesional',
                  'Videos Corporativos', 'Plantillas Corporativas', 'Kits Corporativos',
                  'Premium Gifts', 'Sitios Corporativos', 'Landing Page', 'Web Corporativa',
                  'E-commerce', 'Diagnóstico', 'Plan de Acción', 'Plan Estratégico',
                  'Plan Completo', 'Retainer', '¿Cuánto tiempo antes debo planificar?']

def clean_text(text):
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def is_plan_name(h3_text):
    """Check if an h3 text is a real plan name (not a feature header)."""
    text = h3_text.strip()
    # Exclude known non-plan headers
    for np in NON_PLAN_NAMES:
        if np.lower() == text.lower():
            return False
    # Check if it contains a plan keyword
    for pn in PLAN_NAMES:
        if pn.lower() in text.lower():
            return True
    # Also match "Plan X" patterns
    if text.lower().startswith('plan '):
        return True
    return False

def extract_plans(soup):
    """Extract plan/pricing information with proper filtering."""
    plans = []
    
    for h3 in soup.find_all('h3'):
        h3_text = clean_text(h3.get_text())
        
        if not is_plan_name(h3_text):
            continue
        
        plan = {
            "name": h3_text,
            "original_price": "",
            "discount_percent": "",
            "discounted_price": "",
            "period": "",
            "includes": []
        }
        
        # Navigate up to find the card container with pricing
        card = h3
        for _ in range(10):
            card = card.find_parent()
            if not card:
                break
            card_text = card.get_text()
            if ('S/' in card_text) and len(card.find_all('li')) >= 3:
                break
        
        if not card:
            continue
        
        # Extract original price (line-through)
        orig_price = card.find('span', class_=lambda c: c and 'line-through' in str(c))
        if orig_price:
            plan["original_price"] = clean_text(orig_price.get_text())
        
        # Extract discount percentage
        discount = card.find('span', class_=lambda c: c and 'rounded-full' in str(c) and 'emerald' in str(c))
        if discount:
            disc_text = clean_text(discount.get_text())
            plan["discount_percent"] = disc_text.replace('-', '').replace('%', '').strip()
        
        # Extract current/discounted price and period
        # Look for the period text (/mes, /proyecto, etc.)
        for span in card.find_all('span'):
            span_text = clean_text(span.get_text())
            if any(p in span_text.lower() for p in ['/mes', '/proyecto', 'por día', 'por dia', 'pago único', '/semana']):
                prev = span.find_previous_sibling()
                if prev:
                    price_text = clean_text(prev.get_text())
                    if 'S/' in price_text or '$' in price_text:
                        plan["discounted_price"] = price_text
                plan["period"] = span_text
                break
        
        # Extract list items
        for li in card.find_all('li'):
            li_text = clean_text(li.get_text())
            if li_text and li_text != h3_text:
                plan["includes"].append(li_text)
        
        if plan["includes"] or plan["discounted_price"]:
            plans.append(plan)
    
    return plans

def extract_service_label(soup):
    for span in soup.find_all('span', class_=lambda c: c and 'tracking-wider' in c):
        text = clean_text(span.get_text())
        if text and len(text) < 50:
            return text
    return ""

def extract_hero_description(soup):
    h1 = soup.find('h1')
    if h1:
        parent = h1.find_parent()
        if parent:
            for p in parent.find_all('p'):
                p_text = clean_text(p.get_text())
                if len(p_text) > 50:
                    return p_text
    return ""

def extract_features(soup):
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
                    if h3_text and 'incluye' not in h3_text.lower() and not is_plan_name(h3_text):
                        p = h3.find_next_sibling('p')
                        if not p:
                            parent = h3.find_parent()
                            if parent:
                                p = parent.find('p')
                        desc = clean_text(p.get_text()) if p else ""
                        features.append({"name": h3_text, "description": desc})
    return features

def extract_methodology(soup):
    phases = []
    for h2 in soup.find_all('h2'):
        h2_text = clean_text(h2.get_text())
        if 'proceso' in h2_text.lower():
            section = h2.find_parent('section')
            if not section:
                continue
            for h3 in section.find_all('h3'):
                h3_text = clean_text(h3.get_text())
                if h3_text:
                    p = h3.find_next_sibling('p')
                    if not p:
                        parent = h3.find_parent()
                        if parent:
                            p = parent.find('p')
                    desc = clean_text(p.get_text()) if p else ""
                    phases.append({"name": h3_text, "description": desc})
    return phases

def extract_why_choose(soup):
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

def process_service(filename):
    filepath = os.path.join(BASE_DIR, f"{filename}.json")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        return {"error": f"File not found: {filepath}"}
    
    html_content = data.get("data", {}).get("html", "")
    meta_description = data.get("data", {}).get("description", "")
    title_tag = data.get("data", {}).get("title", "")
    
    soup = BeautifulSoup(html_content, 'lxml')
    
    h1 = soup.find('h1')
    h1_text = clean_text(h1.get_text()) if h1 else ""
    
    # Extract the keyword from meta keywords
    keywords = ""
    meta_kw = soup.find('meta', attrs={'name': 'keywords'})
    if meta_kw:
        keywords = meta_kw.get('content', '')
    
    return {
        "slug": filename.replace('suggestion-svc-', ''),
        "title_tag": title_tag,
        "meta_description": meta_description,
        "meta_keywords": keywords,
        "service_label": extract_service_label(soup),
        "h1_title": h1_text,
        "hero_description": extract_hero_description(soup),
        "features": extract_features(soup),
        "why_choose": extract_why_choose(soup),
        "methodology": extract_methodology(soup),
        "plans": extract_plans(soup),
    }

def main():
    all_services = {}
    
    for svc in SERVICES:
        print(f"Processing: {svc}...")
        result = process_service(svc)
        all_services[svc] = result
    
    # Save clean results
    output_path = os.path.join(BASE_DIR, "services_data.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_services, f, ensure_ascii=False, indent=2)
    print(f"\nResults saved to: {output_path}")
    
    # Print comprehensive summary
    print("\n" + "="*100)
    print("COMPLETE EXTRACTION SUMMARY")
    print("="*100)
    
    for svc in SERVICES:
        r = all_services[svc]
        if "error" in r:
            print(f"\n❌ {svc}: {r['error']}")
            continue
        
        print(f"\n{'━'*100}")
        slug = r.get('slug', '')
        label = r.get('service_label', 'N/A')
        print(f"📋 {label} (slug: {slug})")
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
                print(f"      │  Original:  {p.get('original_price', 'N/A')}")
                print(f"      │  Discount:  {p.get('discount_percent', 'N/A')}%")
                print(f"      │  Price:     {p.get('discounted_price', 'N/A')} {p.get('period', '')}")
                if p.get('includes'):
                    print(f"      │  Includes:")
                    for inc in p['includes']:
                        print(f"      │    ✓ {inc[:100]}")
                print(f"      └─")
        else:
            print(f"\n   💰 PLANS: Quote-based (no fixed plans)")

if __name__ == "__main__":
    main()
