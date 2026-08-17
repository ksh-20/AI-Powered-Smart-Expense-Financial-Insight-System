from typing import List, Dict, Any
from datetime import datetime
import calendar

ESSENTIAL_CATEGORIES = {
    "Groceries",
    "Utilities",
    "Healthcare",
    "Education",
    "Rent",
    "Insurance",
    "Transport",
    "Housing",
    "Bills",
}

DISCRETIONARY_CATEGORIES = {
    "Shopping",
    "Food & Dining",
    "Entertainment",
    "Travel",
    "Leisure",
    "Personal Care",
    "Other",
}


def generate_detailed_insights(
    total: float,
    categories: Dict[str, float],
    expenses: List[Dict[str, Any]] = None,
    budget_goals: List[Dict[str, Any]] = None,
    monthly_budget: float = 0.0,
) -> Dict[str, Any]:
    """
    Generates in-depth, structured financial insights considering user's explicit budget goals,
    portfolio monthly limit, multi-paragraph explanations, actionable checklists,
    benchmark standards, and potential savings calculations.
    """
    if expenses is None:
        expenses = []
    if budget_goals is None:
        budget_goals = []

    count = len(expenses) if expenses else (sum(1 for _ in categories) if categories else 0)
    insights = []
    total_potential_savings = 0.0

    now = datetime.now()
    days_in_month = calendar.monthrange(now.year, now.month)[1]
    days_remaining = max(1, days_in_month - now.day)

    # ── 0. Handle Zero Expenses Case ─────────────────────────────────────────
    if total <= 0 or not categories:
        return {
            "insights": [
                {
                    "id": "welcome_starter",
                    "type": "strategy",
                    "tag": "Getting Started",
                    "title": "Welcome to Smart Financial Insights",
                    "impact_level": "High",
                    "potential_savings": 0.0,
                    "summary": "Begin tracking your expenses to unlock personalized algorithmic insights, budget goal tracking, and optimization strategies.",
                    "detailed_explanation": (
                        "Our financial intelligence engine continuously analyzes your spending velocity, category distributions, "
                        "and budget goal progress. Once you record transactions or configure budget goals, you will receive "
                        "actionable diagnostics on discretionary trimming, 50/30/20 rule alignment, and budget goal pacing."
                    ),
                    "actionable_steps": [
                        "Add your first daily transaction or upload a recent bank statement in the Expenses tab.",
                        "Set up category spending ceilings in the Budget Goals section.",
                        "Categorize recurring bills like utilities, rent, and subscriptions for baseline tracking.",
                    ],
                    "benchmark_comparison": "Regular expense tracking combined with category budget goals reduces impulse purchases by up to 35% within 60 days.",
                }
            ],
            "essential_total": 0.0,
            "discretionary_total": 0.0,
            "essential_pct": 0.0,
            "discretionary_pct": 0.0,
            "potential_monthly_savings": 0.0,
            "health_score": 100,
        }

    # Calculate essential vs discretionary breakdown
    essential_total = 0.0
    discretionary_total = 0.0
    for cat, amt in categories.items():
        if cat in ESSENTIAL_CATEGORIES:
            essential_total += amt
        else:
            discretionary_total += amt

    essential_pct = round((essential_total / total) * 100, 1) if total > 0 else 0.0
    discretionary_pct = round((discretionary_total / total) * 100, 1) if total > 0 else 0.0

    sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
    top_cat_name, top_cat_amt = sorted_cats[0]
    top_cat_pct = round((top_cat_amt / total) * 100, 1) if total > 0 else 0.0

    # ── 1. BUDGET GOAL-SPECIFIC INSIGHTS (HIGHEST PRIORITY) ──────────────────
    budget_goal_cats = {g["category"]: g for g in budget_goals}

    # A. Exceeded Budget Goals
    exceeded_goals = [g for g in budget_goals if g.get("status") == "exceeded" or g.get("percent_used", 0) >= 100]
    for g in exceeded_goals:
        cat = g["category"]
        limit = g.get("monthly_limit", 0.0)
        spent = g.get("spent", 0.0)
        pct = g.get("percent_used", round((spent / max(limit, 1)) * 100, 1))
        overage = round(spent - limit, 2)
        total_potential_savings += overage

        insights.append({
            "id": f"budget_exceeded_{cat.lower().replace(' ', '_')}",
            "type": "warning",
            "tag": "Budget Goal Breach",
            "title": f"🚨 Budget Goal Exceeded: {cat} ({pct}% Used)",
            "impact_level": "High",
            "potential_savings": overage,
            "summary": f"You have spent ₹{spent:,.2f} on {cat}, exceeding your target monthly ceiling of ₹{limit:,.2f} by ₹{overage:,.2f}.",
            "detailed_explanation": (
                f"Your spending in {cat} has breached the defined monthly threshold of ₹{limit:,.2f}. "
                f"An overage of ₹{overage:,.2f} represents a direct deficit against your monthly savings goals. "
                f"Because {days_remaining} days remain in the current billing cycle, continuing unchecked spending in {cat} "
                f"will further expand this deficit. A temporary freeze and budget rebalancing from surplus categories is recommended."
            ),
            "actionable_steps": [
                f"Institute an immediate spending freeze on non-essential {cat} purchases for the remaining {days_remaining} days of the month.",
                f"Reallocate buffer funds from under-utilized categories in Budget Goals to absorb the ₹{overage:,.2f} overage.",
                f"Audit recent itemized transactions in {cat} to check if this was a one-time exceptional expense or a recurring trend.",
            ],
            "benchmark_comparison": "Unchecked category budget overruns compound into a 15-20% annual reduction in net wealth accumulation.",
        })

    # B. Warning Goals (70% - 99% used)
    warning_goals = [g for g in budget_goals if g.get("status") == "warning" or (70 <= g.get("percent_used", 0) < 100)]
    for g in warning_goals:
        cat = g["category"]
        limit = g.get("monthly_limit", 0.0)
        spent = g.get("spent", 0.0)
        pct = g.get("percent_used", round((spent / max(limit, 1)) * 100, 1))
        remaining_budget = round(max(0.0, limit - spent), 2)
        daily_allowance = round(remaining_budget / days_remaining, 2)
        potential_save = round(limit * 0.10, 2)
        total_potential_savings += potential_save

        insights.append({
            "id": f"budget_warning_{cat.lower().replace(' ', '_')}",
            "type": "warning",
            "tag": "Budget Goal Alert",
            "title": f"⚠️ Approaching Budget Cap: {cat} ({pct}% Used)",
            "impact_level": "High",
            "potential_savings": potential_save,
            "summary": f"{cat} has consumed ₹{spent:,.2f} of its ₹{limit:,.2f} monthly limit. Only ₹{remaining_budget:,.2f} remaining for {days_remaining} days.",
            "detailed_explanation": (
                f"You are currently at {pct}% of your defined budget goal for {cat}. "
                f"To avoid a budget limit breach before the month concludes, your allowable expenditure in this category "
                f"must not exceed ₹{daily_allowance:,.2f} per day across the remaining {days_remaining} days. "
                f"Pacing your spending strictly to this run-rate will successfully preserve your monthly savings margin."
            ),
            "actionable_steps": [
                f"Cap {cat} expenditures at no more than ₹{daily_allowance:,.2f} per day for the next {days_remaining} days.",
                f"Postpone discretionary or non-urgent {cat} orders until the next calendar month reset.",
                f"Review recent receipts in {cat} to ensure duplicate charges or unwanted subscriptions are eliminated.",
            ],
            "benchmark_comparison": "Proactively pacing categories at the 70% threshold prevents over 85% of end-of-month budget deficits.",
        })

    # C. Safe / Well-Controlled Goals (if no breaches exist, highlight positive adherence)
    safe_goals = [g for g in budget_goals if g.get("status") == "safe" or g.get("percent_used", 0) < 70]
    if safe_goals and len(exceeded_goals) == 0:
        top_safe = min(safe_goals, key=lambda x: x.get("percent_used", 0))
        cat = top_safe["category"]
        limit = top_safe.get("monthly_limit", 0.0)
        spent = top_safe.get("spent", 0.0)
        pct = top_safe.get("percent_used", round((spent / max(limit, 1)) * 100, 1))
        headroom = round(limit - spent, 2)

        insights.append({
            "id": f"budget_adherence_{cat.lower().replace(' ', '_')}",
            "type": "achievement",
            "tag": "Goal Discipline",
            "title": f"✓ Excellent Budget Adherence: {cat} ({pct}% Used)",
            "impact_level": "Strategy",
            "potential_savings": 0.0,
            "summary": f"Strong cost discipline in {cat}: only ₹{spent:,.2f} spent against ₹{limit:,.2f} goal, leaving ₹{headroom:,.2f} in headroom.",
            "detailed_explanation": (
                f"Your expenditure in {cat} is tracking exceptionally well at only {pct}% of its monthly allocation. "
                f"Preserving ₹{headroom:,.2f} in unused category allowance provides a healthy financial buffer that can be "
                f"routed directly into your savings goals or investment portfolio at month-end."
            ),
            "actionable_steps": [
                f"Maintain your current spending discipline in {cat} through the remainder of the month.",
                f"At month-end, transfer any unspent buffer from this ₹{headroom:,.2f} headroom into an emergency fund or mutual fund SIP.",
                f"Use this disciplined pacing as a benchmark model for your other discretionary categories.",
            ],
            "benchmark_comparison": "Consistently staying under category limits accelerates financial independence milestones by 2.2x.",
        })

    # D. Suggest Budget Goals for Uncapped High-Spend Categories
    for cat, amt in sorted_cats:
        if cat not in budget_goal_cats and amt >= (total * 0.18) and amt >= 1000:
            suggested_cap = round(amt * 0.85, 2)
            potential_save = round(amt * 0.15, 2)
            total_potential_savings += potential_save
            insights.append({
                "id": f"suggest_goal_{cat.lower().replace(' ', '_')}",
                "type": "strategy",
                "tag": "Goal Recommendation",
                "title": f"🎯 Uncapped Spending: Set a Budget Goal for {cat}",
                "impact_level": "Medium",
                "potential_savings": potential_save,
                "summary": f"You have spent ₹{amt:,.2f} on {cat} without an active budget cap. Setting a goal of ₹{suggested_cap:,.2f} is recommended.",
                "detailed_explanation": (
                    f"{cat} is one of your major spending categories (₹{amt:,.2f}), but currently has no active budget limit set. "
                    f"Without an explicit spending ceiling, discretionary drift often leads to unmonitored cost escalation. "
                    f"Establishing a monthly goal of ₹{suggested_cap:,.2f} in the Budget Goals tab will provide real-time threshold alerts "
                    f"and unlock approximately ₹{potential_save:,.2f} in structured monthly savings."
                ),
                "actionable_steps": [
                    f"Navigate to the Budget Goals page and create a monthly target limit of ₹{suggested_cap:,.2f} for {cat}.",
                    f"Enable budget threshold alerts to be notified when you reach 70% of this cap.",
                    f"Track weekly spending increments to ensure adherence throughout the month.",
                ],
                "benchmark_comparison": "Categories with explicit budget limits experience 24% lower monthly variance than unbudgeted categories.",
            })
            break

    # E. Overall Portfolio Monthly Budget Target Analysis
    if monthly_budget > 0:
        budget_used_pct = round((total / monthly_budget) * 100, 1)
        if total > monthly_budget:
            overage = round(total - monthly_budget, 2)
            insights.append({
                "id": "portfolio_budget_breach",
                "type": "warning",
                "tag": "Overall Budget Breach",
                "title": f"⚠️ Total Outflow Exceeded Monthly Budget ({budget_used_pct}%)",
                "impact_level": "High",
                "potential_savings": overage,
                "summary": f"Total spending of ₹{total:,.2f} exceeds your portfolio monthly budget of ₹{monthly_budget:,.2f} by ₹{overage:,.2f}.",
                "detailed_explanation": (
                    f"Your aggregate expenditures have surpassed your overall monthly ceiling of ₹{monthly_budget:,.2f}. "
                    f"To prevent ongoing capital erosion, prioritize cutting non-essential lifestyle categories (Shopping, Dining, Entertainment) "
                    f"and freeze unnecessary discretionary orders until next month's budget reset."
                ),
                "actionable_steps": [
                    "Audit total discretionary spending and pause non-urgent lifestyle purchases.",
                    "Review active category limits in Budget Goals to align sub-budgets with your overall portfolio ceiling.",
                    "Ensure upcoming essential bills (rent, utilities) are accounted for within your cash reserves.",
                ],
                "benchmark_comparison": "Adhering to an overall monthly budget ceiling is the single strongest predictor of long-term financial security.",
            })

    # ── 2. GENERAL PORTFOLIO & CATEGORY INSIGHTS ───────────────────────────────

    # Single-Item Case
    if count == 1 or len(sorted_cats) == 1 and count <= 2:
        exp = expenses[0] if expenses else {"amount": top_cat_amt, "category": top_cat_name, "description": "Recorded expense"}
        amt = exp.get("amount", top_cat_amt)
        cat = exp.get("category", top_cat_name)
        desc = exp.get("description", "Recorded expense")

        insights.append({
            "id": "single_baseline_diagnostic",
            "type": "opportunity",
            "tag": "Baseline Analysis",
            "title": f"Initial Expense Anchor in {cat} (₹{amt:,.2f})",
            "impact_level": "High",
            "potential_savings": round(amt * 0.15, 2),
            "summary": f"Your recorded transaction of ₹{amt:,.2f} at '{desc}' represents your current baseline outflow.",
            "detailed_explanation": (
                f"You have established an initial expenditure benchmark in {cat}. "
                f"Establishing disciplined run-rate tracking now will allow our algorithms to forecast your month-end cash flow accurately. "
                f"Connecting category budget limits will ensure your ongoing spending remains well within your target."
            ),
            "actionable_steps": [
                f"Log at least 3-5 additional routine transactions to build a comprehensive category baseline.",
                f"Define a monthly budget ceiling for {cat} in the Budget Goals tab to prevent unexpected overruns.",
                f"If this is a recurring monthly bill, set a calendar reminder to review rate changes or subscription tiers.",
            ],
            "benchmark_comparison": "Tracking the first 5 transactions increases monthly savings adherence by over 35%.",
        })

        cat_advice = get_category_specific_advisory(cat, amt)
        insights.append({
            "id": f"single_cat_advisory_{cat.lower().replace(' ', '_')}",
            "type": "strategy",
            "tag": f"{cat} Strategy",
            "title": f"Strategic Financial Advisory for {cat}",
            "impact_level": "Medium",
            "potential_savings": round(amt * 0.10, 2),
            "summary": cat_advice["summary"],
            "detailed_explanation": cat_advice["explanation"],
            "actionable_steps": cat_advice["steps"],
            "benchmark_comparison": cat_advice["benchmark"],
        })

        insights.append({
            "id": "single_50_30_20_framework",
            "type": "tip",
            "tag": "Financial Blueprint",
            "title": "Adopting the 50/30/20 Wealth Allocation Blueprint",
            "impact_level": "High",
            "potential_savings": round(amt * 0.20, 2),
            "summary": "Structure your ongoing expenses around 50% Needs, 30% Wants, and 20% Savings.",
            "detailed_explanation": (
                "The 50/30/20 rule is a time-tested financial architecture designed to build wealth while maintaining lifestyle balance. "
                f"Your current transaction in {cat} falls under the '{'Needs' if cat in ESSENTIAL_CATEGORIES else 'Wants'}' pillar. "
                "As you record additional expenses, our system will calculate your real-time pillar split to ensure you remain "
                "on track to save at least 20% of your earnings every month."
            ),
            "actionable_steps": [
                "Classify upcoming expenses into Essential Needs vs. Discretionary Wants.",
                "Automate a fixed transfer of 20% of monthly income directly into a high-yield savings or mutual fund account.",
                "Review discretionary spending weekly to ensure lifestyle creep does not erode your savings margin.",
            ],
            "benchmark_comparison": "Individuals following the 50/30/20 rule accumulate an emergency fund 2.4x faster than unstructured spenders.",
        })

    # Multi-Item Case
    else:
        # Concentration Driver
        if top_cat_pct >= 35 and not any(i["tag"] == "Budget Goal Breach" for i in insights):
            savings_calc = round(top_cat_amt * 0.15, 2)
            total_potential_savings += savings_calc
            insights.append({
                "id": "concentration_driver",
                "type": "warning" if top_cat_pct >= 50 else "opportunity",
                "tag": "Concentration Risk",
                "title": f"Dominant Outflow: {top_cat_name} ({top_cat_pct}% of Total Spending)",
                "impact_level": "High",
                "potential_savings": savings_calc,
                "summary": f"{top_cat_name} accounts for ₹{top_cat_amt:,.2f} ({top_cat_pct}% of all outflows), making it your primary expenditure driver.",
                "detailed_explanation": (
                    f"When a single category claims over {top_cat_pct}% of your overall financial outflow, any cost volatility or unchecked "
                    f"spending here directly impacts your ability to save. By applying a focused 15% optimization strategy to {top_cat_name}, "
                    f"you could unlock approximately ₹{savings_calc:,.2f} in freed cash flow each month."
                ),
                "actionable_steps": [
                    f"Audit the largest individual transactions in {top_cat_name} to spot one-time splurges vs. recurring leaks.",
                    f"Set a strict monthly limit for {top_cat_name} in the Budget Goals section to get automated threshold warnings.",
                    f"Institute a 48-hour cooling period for any non-essential purchase in this category above ₹1,000.",
                ],
                "benchmark_comparison": "Balanced financial profiles maintain their top non-housing category under 25-30% of total outflow.",
            })

        # Discretionary vs Essential Ratio
        if discretionary_pct >= 45:
            savings_disc = round(discretionary_total * 0.18, 2)
            total_potential_savings += savings_disc
            insights.append({
                "id": "wants_optimization",
                "type": "opportunity",
                "tag": "Lifestyle Ratio",
                "title": f"Elevated Lifestyle & Discretionary Outflows ({discretionary_pct}%)",
                "impact_level": "High",
                "potential_savings": savings_disc,
                "summary": f"Discretionary spending totals ₹{discretionary_total:,.2f} ({discretionary_pct}% of budget) vs ₹{essential_total:,.2f} in essentials.",
                "detailed_explanation": (
                    f"Your non-essential lifestyle outflows (Shopping, Dining, Entertainment, Leisure) represent {discretionary_pct}% of total spending. "
                    f"While leisure and comfort are important, the standard 50/30/20 guideline recommends capping discretionary wants at 30%. "
                    f"Realigning your discretionary spending closer to recommended benchmarks could yield up to ₹{savings_disc:,.2f} in monthly capital retention."
                ),
                "actionable_steps": [
                    "Identify high-frequency discretionary habits (e.g. food delivery, online shopping) and substitute with cost-effective alternatives.",
                    "Adopt a dedicated weekly allowance in Budget Goals for monthly leisure spending.",
                    "Cancel unused subscriptions and streaming services that have not been used in the past 30 days.",
                ],
                "benchmark_comparison": "The 50/30/20 framework suggests keeping Discretionary Wants under 30% to guarantee long-term wealth building.",
            })

        # Category Strategy for Top Discretionary Outflow
        discretionary_cats = [(c, a) for c, a in sorted_cats if c in DISCRETIONARY_CATEGORIES]
        if discretionary_cats:
            target_cat, target_amt = discretionary_cats[0]
            cat_advice = get_category_specific_advisory(target_cat, target_amt)
            savings_target = round(target_amt * 0.12, 2)
            total_potential_savings += savings_target
            insights.append({
                "id": f"cat_action_{target_cat.lower().replace(' ', '_')}",
                "type": "strategy",
                "tag": f"{target_cat} Strategy",
                "title": f"Actionable Cost Reduction Strategy for {target_cat}",
                "impact_level": "Medium",
                "potential_savings": savings_target,
                "summary": cat_advice["summary"],
                "detailed_explanation": cat_advice["explanation"],
                "actionable_steps": cat_advice["steps"],
                "benchmark_comparison": cat_advice["benchmark"],
            })

        # Annual Compounding Potential
        annual_compounded = total_potential_savings * 12
        if annual_compounded >= 1000:
            growth_10yr = annual_compounded * 10 * 1.75
            insights.append({
                "id": "compounding_projection",
                "type": "achievement",
                "tag": "Wealth Compounding",
                "title": f"Annual Compounding Potential: ₹{annual_compounded:,.2f}/year",
                "impact_level": "High",
                "potential_savings": round(total_potential_savings, 2),
                "summary": f"Applying these budget optimizations can save you ₹{total_potential_savings:,.2f} monthly (₹{annual_compounded:,.2f} annually).",
                "detailed_explanation": (
                    f"Small daily and weekly spending optimizations generate substantial long-term wealth when compounded. "
                    f"Redirecting ₹{total_potential_savings:,.2f} per month into a broad market index fund or disciplined investment plan (assuming an 11% annual return) "
                    f"is projected to grow into approximately ₹{growth_10yr:,.2f} over the next decade. "
                    f"Discipline in your category budget goals today creates substantial financial freedom tomorrow."
                ),
                "actionable_steps": [
                    f"Set up an automated monthly SIP/investment for ₹{total_potential_savings:,.2f} to capture these savings immediately on payday.",
                    "Review Budget Goal progress on the 15th of every month to make mid-month course corrections.",
                    "Reinvest any unspent category budget surpluses rather than treating them as permission to overspend.",
                ],
                "benchmark_comparison": "Saving and investing ₹5,000/month at 11% CAGR yields over ₹10.9 Lakhs in 10 years.",
            })

    # Calculate Health Score
    health_score = 90
    if len(exceeded_goals) > 0:
        health_score -= (len(exceeded_goals) * 15)
    if len(warning_goals) > 0:
        health_score -= (len(warning_goals) * 8)
    if discretionary_pct > 50:
        health_score -= 10
    if top_cat_pct > 50:
        health_score -= 8
    health_score = max(30, min(98, health_score))

    return {
        "insights": insights,
        "recommendations": [i["summary"] for i in insights],
        "essential_total": essential_total,
        "discretionary_total": discretionary_total,
        "essential_pct": essential_pct,
        "discretionary_pct": discretionary_pct,
        "potential_monthly_savings": round(total_potential_savings, 2),
        "health_score": health_score,
        "budget_goals_summary": {
            "total_goals": len(budget_goals),
            "exceeded_count": len(exceeded_goals),
            "warning_count": len(warning_goals),
            "safe_count": len(safe_goals),
        },
    }


def get_category_specific_advisory(cat: str, amt: float) -> Dict[str, Any]:
    """Returns domain-specific, actionable advice tailored to a category."""
    advisories = {
        "Shopping": {
            "summary": f"Control Shopping outflows (₹{amt:,.2f}) by enforcing an impulse cooling rule and cart audits.",
            "explanation": (
                "E-commerce platforms utilize flash sales, limited-time deals, and personalized algorithms to induce impulse purchases. "
                "Categorizing shopping into 'essential replacements' vs. 'lifestyle upgrades' allows you to curb emotional buying. "
                "Implementing a 48-hour wish-list delay significantly reduces unneeded order volume."
            ),
            "steps": [
                "Institute a mandatory 48-hour cooling period for any non-essential purchase above ₹1,000.",
                "Unsubscribe from promotional retailer newsletters and remove stored payment cards from shopping apps.",
                "Review order histories at month-end and return unopened impulse purchases within the return window.",
            ],
            "benchmark": "Financial advisors recommend restricting discretionary lifestyle shopping to under 15% of net monthly income.",
        },
        "Food & Dining": {
            "summary": f"Optimize Food & Dining (₹{amt:,.2f}) by capping weekly delivery orders and planning meals.",
            "explanation": (
                "Food delivery services and frequent dining out carry a 2.5x to 3x premium over groceries and home-cooked meals due to delivery fees, platform markups, and tips. "
                "Trimming delivery frequency by just 2 orders per week can save between ₹3,000 to ₹6,000 each month without compromising nutrition or social lifestyle."
            ),
            "steps": [
                "Designate specific weekend days for dining out while batch-prepping weekday meals.",
                "Set a weekly food delivery cap and remove surge-priced rush orders.",
                "Audit coffee and takeaway snack expenses to prevent small daily leaks from compounding.",
            ],
            "benchmark": "Standard financial models allocate between 10-15% of total monthly budget to combined dining and groceries.",
        },
        "Transport": {
            "summary": f"Streamline Transport costs (₹{amt:,.2f}) through multi-modal commuting and fuel optimization.",
            "explanation": (
                "Daily ride-hailing (Uber/Ola) and peak-hour surge pricing quickly multiply monthly commuting expenses. "
                "Combining public transit (metro, rail) with subscription ride passes or carpooling cuts transport burn by 30-40%."
            ),
            "steps": [
                "Utilize metro or public transit for routine fixed-distance work commutes.",
                "Purchase monthly or quarterly transit passes to lock in subsidized fare discounts.",
                "Group personal errands into single consolidated trips to save fuel and parking charges.",
            ],
            "benchmark": "Urban commuters spend an average of 8-12% of their monthly income on local transport.",
        },
        "Utilities": {
            "summary": f"Audit recurring Utilities (₹{amt:,.2f}) to eliminate phantom power drain and broadband overages.",
            "explanation": (
                "Utility costs often climb due to outdated mobile/broadband plans, inefficient appliance usage, and unreviewed auto-pay rates. "
                "Auditing monthly bills once per quarter ensures you are on the most competitive consumer tariff."
            ),
            "steps": [
                "Review broadband and mobile plans to downgrade unused bandwidth or data tiers.",
                "Switch home lighting to high-efficiency LED fixtures and unplug phantom appliances when not in use.",
                "Pay utility bills through cash-back credit cards or apps to earn recurring rebates.",
            ],
            "benchmark": "Household utilities typically account for 5-8% of total monthly living expenses.",
        },
        "Entertainment": {
            "summary": f"Trim Entertainment spending (₹{amt:,.2f}) by consolidating active streaming subscriptions.",
            "explanation": (
                "Subscription creep is one of the most common hidden expenses. Having multiple active OTT streaming platforms, gaming passes, and digital memberships simultaneously often results in paying for services that go unused for weeks."
            ),
            "steps": [
                "Conduct a monthly subscription audit and cancel services not used in the last 30 days.",
                "Rotate streaming subscriptions (subscribe to one at a time, watch, then switch).",
                "Explore family or annual bundle plans to reduce per-service monthly subscription rates.",
            ],
            "benchmark": "Digital entertainment and streaming should be budgeted under 5% of monthly discretionary spend.",
        },
        "Healthcare": {
            "summary": f"Maintain proactive Healthcare tracking (₹{amt:,.2f}) while utilizing generic medicines and preventive wellness.",
            "explanation": (
                "While health expenditures are essential, purchasing generic branded pharmaceuticals and scheduling annual preventive check-ups prevents costly emergency interventions later."
            ),
            "steps": [
                "Ask physicians for generic equivalents on routine prescriptions to save up to 60% on medicine costs.",
                "Ensure health insurance policies are active with adequate hospital room rent and cashless network coverage.",
                "Maintain digital copies of medical bills for annual tax deduction claims where applicable.",
            ],
            "benchmark": "Maintaining a dedicated health emergency fund covering at least 3 months of family medical needs is recommended.",
        },
        "Education": {
            "summary": f"Maximize return on Education & Learning investments (₹{amt:,.2f}) through self-paced learning resources.",
            "explanation": (
                "Investing in skills, certifications, and educational materials yields high career dividends, but auditing course completion rates prevents buying courses that remain unfinished."
            ),
            "steps": [
                "Complete active ongoing courses before purchasing new educational material.",
                "Explore employer-sponsored learning budgets and tuition reimbursement programs.",
                "Utilize open-source documentation, academic libraries, and verified free certification tracks.",
            ],
            "benchmark": "Lifelong learning investments between 3-5% of annual income generate positive career ROI.",
        },
        "Groceries": {
            "summary": f"Optimize Grocery expenditures (₹{amt:,.2f}) through bulk staple buying and planned shopping lists.",
            "explanation": (
                "Supermarket impulse purchases and food waste are the primary drivers of grocery inflation. Sticking to a written list and purchasing non-perishable staples in bulk significantly lowers average unit costs."
            ),
            "steps": [
                "Create a weekly meal plan and grocery list before shopping to avoid impulse cart additions.",
                "Buy non-perishable staples (rice, pulses, oils, grains) in bulk wholesale quantities.",
                "Track expiration dates on perishable produce to minimize household food waste.",
            ],
            "benchmark": "Groceries represent the core foundation of Essential Needs, typically recommended at 12-18% of monthly income.",
        },
    }

    return advisories.get(
        cat,
        {
            "summary": f"Track and optimize your spending in {cat} (₹{amt:,.2f}) with structured monthly caps.",
            "explanation": (
                f"Analyzing category outflows in {cat} helps identify recurring trends and prevent lifestyle inflation. "
                f"Establishing a clear monthly ceiling ensures your spending aligns with your broader financial roadmap."
            ),
            "steps": [
                f"Review itemized transactions in {cat} for recurring patterns.",
                f"Set a monthly target cap for {cat} in the Budget Goals section.",
                "Monitor spending pacing weekly to stay under your defined target.",
            ],
            "benchmark": "Maintaining all non-essential categories under defined budget limits accelerates monthly savings rate.",
        },
    )