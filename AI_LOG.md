# Task 2 — AI build log (WhatsApp AI Agent Panel)

**Live URL:** https://whatsapp-agent-panel.vercel.app/  
**Source:** https://github.com/maheshmishra1691/whatsapp-agent-panel  

Full verbatim prompts and the failure/fix table are inlined in `Scale100x-AI-PM-Assignment-Submission.md` § Task 2 (so reviewers need no local files).

## Summary

| | |
|---|---|
| What AI got wrong | 1024px layout, header overflow, lying `leadsToday`, frozen seed clock, reset races, `handback`/`lead_message` counted wrong, missing chip states, Vercel flaky deploy |
| Fixed manually | Handler table shared with Task-1 §1c; seed 76/24 from counted log; layout/KPI/reset; redeploy |
| One more day | Real WABA webhook, `action_log` CSV export, Playwright T1–T7, brand-level thresholds |
