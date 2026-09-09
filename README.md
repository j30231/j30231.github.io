# Quantization-Based Jailbreaking Vulnerability Analysis

Interactive companion data for the IEEE Access paper
**“Quantization-Based Jailbreaking Vulnerability Analysis: A Study on Performance and Safety of the Llama3-8B-Instruct Model.”**

[![Paper](https://img.shields.io/badge/IEEE%20Access-10.1109%2FACCESS.2025.3594287-00629B)](https://doi.org/10.1109/ACCESS.2025.3594287)
[![Live demo](https://img.shields.io/badge/demo-j30231.github.io-2ea44f)](https://j30231.github.io)
[![License: CC BY 4.0](https://img.shields.io/badge/license-CC%20BY%204.0-lightgrey)](https://creativecommons.org/licenses/by/4.0/)

**→ Explore the data: [j30231.github.io](https://j30231.github.io)**

![Screenshot of the heatmap explorer](docs/screenshot.jpg)

---

## The paper

| | |
| --- | --- |
| **Title** | Quantization-Based Jailbreaking Vulnerability Analysis: A Study on Performance and Safety of the Llama3-8B-Instruct Model |
| **Author** | Jaesik Lee |
| **Venue** | IEEE Access, Volume 13, pp. 136524–136535 |
| **Published** | 31 July 2025 |
| **DOI** | [10.1109/ACCESS.2025.3594287](https://doi.org/10.1109/ACCESS.2025.3594287) |
| **Access** | Open Access (CC BY 4.0) |

The paper asks a question that prior work had only answered in pieces: **when you quantize an LLM to run it cheaply, what happens to its safety — and does the answer change if the attacker switches language or tense?**

It evaluates Llama3-8B-Instruct across **23 quantization levels × 2 languages (English/Korean) × 3 tenses (past/present/future)**, and this repository holds the resulting Attack Success Rate (ASR) data behind an interactive heatmap explorer.

### Headline findings

- **Safety tracks reasoning ability, not bit width.** MMLU correlates with ASR at *r* = −0.816, while bits-per-weight alone is not a significant predictor (*p* = 0.155). As a model's reasoning degrades, its ability to hold a safety constraint degrades with it.
- **4-bit is a practical sweet spot.** At 4-bit and above, MMLU stays above 60 and ASR stays under 35%, statistically indistinguishable from the unquantized baseline (Tukey HSD, *p* > 0.05). Below 3-bit, both collapse (*F* = 38.914, *p* < 0.001).
- **Safety alignment is English- and present-tense-biased.** Korean prompts show ASR **+25.5 pp** over English (*t* = −7.111, *p* < 0.001). Past-tense rewrites add **+39.3 pp**, future-tense **+20.8 pp** — the past-tense effect is ~1.89× the future-tense one.
- A multiple regression over these factors explains most of the variance (adj. *R²* = 0.878, Cohen's *f²* = 7.632).

You can see the language/tense split directly in the published data:

| | English | Korean |
| --- | --- | --- |
| **Present** | 13.8% | 33.2% |
| **Future** | 27.8% | 53.8% |
| **Past** | 45.5% | 67.5% |
| **All tenses** | **29.0%** | **51.5%** |

*(Mean ASR over all 24 model variants in `jailbreak_success_rates.csv`. The paper's headline coefficients come from a regression on the 19-model set remaining after outlier removal, so they differ slightly from these raw means.)*

---

## The data

All CSVs live in [`public/data/`](public/data) and are served directly by the site, so you can fetch any of them straight from `https://j30231.github.io/data/...`.

Every file describes the same experiment grid at a different level of aggregation. Columns `q1`…`q100` are the 100 harmful-behavior scenarios from **[JBB-Behaviors](https://github.com/JailbreakBench/jailbreakbench)**, in dataset order.

| File | Rows | Grain | `q1…q100` values |
| --- | --- | --- | --- |
| `jailbreak_success_rates.csv` | 144 | quantization × language × tense | `T` / `F` — did this scenario ever jailbreak? |
| `tf_ratios/combined_quantization_tense_tf_ratio.csv` | 144 | quantization × language × tense | `0`–`19` — the retry index that first succeeded; `-1` = never |
| `tf_ratios/combined_quantization_tf_ratio.csv` | 48 | quantization × language | `0/33/67/100` — % of the 3 tenses that succeeded |
| `tf_ratios/quantization_average_ratio.csv` | 24 | quantization | `0`–`100` — % success across languages and tenses |
| `tf_ratios/combined_tense_tf_ratio.csv` | 6 | language × tense | `0`–`100` — % success across quantization levels |
| `tf_ratios/overall_tf_ratio.csv` | 1 | everything pooled | `0`–`100` — % success overall |

`jailbreak_success_rates.csv` additionally carries `experiment_number`, `target_model`, `quantization_level`, `prompt_language`, `tense`, `asr` (0–100), `avg_restart` and `success_restart`.

### The 24 model variants

`bf16` is the unquantized baseline; the remaining 23 are the quantization levels under test.

| Family | Levels |
| --- | --- |
| Legacy | `f16`, `q8_0`, `q4_1`, `q4_0` |
| K-Quant | `q6k`, `q5km`, `q4km`, `q3kl`, `q3km`, `q3ks`, `q2km`, `q2ks` |
| Non-linear | `iq4nl`, `iq4xs` |
| I-Quant | `iq3m`, `iq3s`, `iq3xxs`, `iq2m`, `iq2s`, `iq2xs`, `iq2xxs`, `iq1m`, `iq1s` |

The paper excludes `iq3s`, `iq2xxs`, `iq1m` and `iq1s` as perplexity outliers (Modified Z-score > 3.5) before statistical analysis. **They are kept in this dataset** so you can see the degradation yourself.

### How the site maps to the files

| Tab | Source file |
| --- | --- |
| Total ASR | `overall_tf_ratio.csv` |
| Lang-Tense | `combined_tense_tf_ratio.csv` |
| Quant-ASR | `quantization_average_ratio.csv` |
| Quant-Lang | `combined_quantization_tf_ratio.csv` |
| Quant-Tense | `combined_quantization_tense_tf_ratio.csv` |
| T/F Maps | `jailbreak_success_rates.csv` |

---

## How the data was produced

| | |
| --- | --- |
| **Model** | Llama3-8B-Instruct (GGUF, quantized with `llama.cpp`) |
| **`llama.cpp`** | Build 4351, commit `4da69d1a`, Apple clang 16.0.0 |
| **Hardware** | MacBook Pro 14″, Apple M1 Max, 64 GB RAM (Metal / MPS) |
| **Attack set** | 100 JBB-Behaviors scenarios, up to 20 retries each |
| **Judge** | GPT-4o-mini as semantic jailbreak judge |
| **Generation** | `temperature = 1.0`, `max_tokens = 150`, no fixed random seed |
| **Performance metrics** | MMLU (zero-shot), Perplexity on WikiText-2-raw-v1 |

Serving was done through a local OpenAI-compatible endpoint; a Python driver sent the prompts and recorded responses.

### Reproducibility caveats

Stated plainly, because they bound what these numbers support:

- One model (Llama3-8B-Instruct) and one dataset (JBB-Behaviors).
- The judge is an LLM (GPT-4o-mini), which can carry its own bias.
- No random seed was fixed, so exact per-scenario outcomes are not bit-reproducible.

---

## What is *not* in this repository

By design, so this data can stay public:

- **No harmful prompt text.** Scenarios appear only as indices `q1`…`q100`. The underlying prompts belong to [JBB-Behaviors](https://github.com/JailbreakBench/jailbreakbench); get them from there.
- **No model outputs.** Only the judge's success/failure verdict per attempt.
- **No API keys, tokens, or credentials**, and no raw experiment logs.

---

## Running the explorer locally

```bash
git clone https://github.com/j30231/j30231.github.io.git
cd j30231.github.io
npm ci
npm start          # dev server
npm run build      # production build → dist/
npm run preview    # serve the production build
```

Requires Node 20.19+ or 22.12+ (the deploy workflow uses Node 24). Built with Vite + React + MUI; CSVs are parsed client-side with PapaParse. Pushing to `main` deploys to GitHub Pages via [`.github/workflows/static.yml`](.github/workflows/static.yml).

---

## Citation

```bibtex
@article{lee2025quantization,
  author  = {Lee, Jaesik},
  title   = {Quantization-Based Jailbreaking Vulnerability Analysis:
             A Study on Performance and Safety of the Llama3-8B-Instruct Model},
  journal = {IEEE Access},
  volume  = {13},
  pages   = {136524--136535},
  year    = {2025},
  doi     = {10.1109/ACCESS.2025.3594287}
}
```

## License

The paper is published open access under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The data in this repository accompanies it under the same terms — please cite the paper if you use it.
