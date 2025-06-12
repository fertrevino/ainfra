# 🛠️ AInfra

**AInfra turns plain English into production‑ready cloud infrastructure — and teaches you the tech stack as it goes.**

---

## ✨ What is AInfra?

AInfra is a conversational assistant for developers and cloud beginners alike. Tell it something like:

> *“Make a GCS bucket with versioning and lifecycle rules.”*

…and AInfra will:

1. **Design** the required resources for GCP.
2. **Generate** clean, idiomatic Terraform you can inspect or extend.
3. **Explain** every choice in beginner‑friendly language so you learn best practices.
4. **Validate & secure** the plan with `terraform validate`, tfsec, tflint.
5. **Draw** an architecture diagram so you can visualise what will be created.
6. **Deploy** the stack on your command — or let you download and run the code yourself.

---

## 🧑‍🎓 How it helps you

* **Learn by doing** – see exactly which Terraform blocks correspond to your request.
* **Immediate feedback** – security & lint warnings surface in plain English.
* **Safe sandbox** – nothing is applied without your green light; you stay in control.
* **Step‑by‑step reasoning** – short explanations introduce key cloud concepts as you go.

---

## 🔍 How it works

Your prompt enters the chat UI. A dispatcher decides how to process your request, coordinating code generation and validation. The result: a Terraform bundle, a validation report, an architecture diagram — plus concise explanations so you understand **why** the code looks the way it does.

---

## 🚧 Project status & contributing

AInfra is **alpha**: GCP support is in progress. Pull requests and issue reports are welcome — from new cloud modules and docs to UI polish. See `CONTRIBUTING.md` for guidelines.

---
