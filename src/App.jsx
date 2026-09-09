import React from 'react';
import {
  Box, Button, Chip, Container, Divider, Link, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import JailbreakHeatmap from './components/JailbreakHeatmap';

const PAPER_URL = 'https://doi.org/10.1109/ACCESS.2025.3594287';
const REPO_URL = 'https://github.com/j30231/j30231.github.io';

const FINDINGS = [
  {
    stat: 'r = −0.816',
    title: 'Safety tracks reasoning, not bit width',
    body: 'MMLU correlates strongly with attack success rate, while bits-per-weight on its own is not a significant predictor (p = 0.155). As reasoning degrades, so does the model’s grip on its safety constraints.',
  },
  {
    stat: '+25.5 pp',
    title: 'Korean prompts jailbreak far more often',
    body: 'Korean shows a markedly higher attack success rate than English under otherwise identical conditions (t = −7.111, p < 0.001) — evidence that safety alignment is English-centric.',
  },
  {
    stat: '+39.3 pp',
    title: 'Past tense is the strongest lever',
    body: 'Rewriting a refused request in the past tense raises the attack success rate sharply; future tense adds +20.8 pp. The past-tense effect is about 1.89× the future-tense one.',
  },
  {
    stat: '4-bit',
    title: 'A practical performance–safety balance',
    body: 'At 4-bit and above, MMLU stays above 60 and ASR under 35% — statistically indistinguishable from the unquantized baseline. Below 3-bit, both collapse (F = 38.914, p < 0.001).',
  },
];

const LANG_TENSE = [
  ['Present', '13.8%', '33.2%'],
  ['Future', '27.8%', '53.8%'],
  ['Past', '45.5%', '67.5%'],
];

const SETUP = [
  ['Model', 'Llama3-8B-Instruct (GGUF, quantized with llama.cpp)'],
  ['Grid', '23 quantization levels × 2 languages × 3 tenses = 144 conditions'],
  ['Attack set', '100 JBB-Behaviors scenarios, up to 20 retries each'],
  ['Judge', 'GPT-4o-mini as semantic jailbreak judge'],
  ['Hardware', 'MacBook Pro 14″, Apple M1 Max, 64 GB RAM (Metal / MPS)'],
  ['Generation', 'temperature = 1.0, max_tokens = 150, no fixed seed'],
];

function Section({ id, eyebrow, title, children }) {
  return (
    <Box component="section" id={id} sx={{ mt: 7 }}>
      {eyebrow && (
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function App() {
  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', pb: 8 }}>
      {/* ---------- Hero ---------- */}
      <Box sx={{ bgcolor: 'common.white', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Chip
            label="IEEE Access · Open Access"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '1.9rem', md: '2.6rem' } }}>
            Quantization-Based Jailbreaking Vulnerability Analysis
          </Typography>
          <Typography variant="h6" component="p" sx={{ mt: 1.5, color: 'text.secondary', fontWeight: 400, maxWidth: '62ch' }}>
            What happens to a language model’s safety when you shrink it to run cheaply —
            and does the answer change if the attacker switches language or tense?
          </Typography>

          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
            Jaesik Lee, “Quantization-Based Jailbreaking Vulnerability Analysis: A Study on
            Performance and Safety of the Llama3-8B-Instruct Model,” <em>IEEE Access</em>,
            vol. 13, pp. 136524–136535, 2025.
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ mt: 3, flexWrap: 'wrap', gap: 1.5 }}>
            <Button variant="contained" href={PAPER_URL} target="_blank" rel="noopener noreferrer">
              Read the paper
            </Button>
            <Button variant="outlined" href="#explore">
              Explore the data
            </Button>
            <Button variant="outlined" href={REPO_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ display: 'block', mt: 2.5, color: 'text.secondary' }}>
            DOI:{' '}
            <Link href={PAPER_URL} target="_blank" rel="noopener noreferrer">10.1109/ACCESS.2025.3594287</Link>
            {' · Data licensed '}
            <Link href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</Link>
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* ---------- What this is ---------- */}
        <Section eyebrow="What this is" title="The data behind the paper, in full">
          <Typography variant="body1" sx={{ maxWidth: '75ch', color: 'text.primary' }}>
            Quantization is how large models get small enough to run on ordinary hardware. It is
            well understood that it costs some accuracy. This study asks what it costs in{' '}
            <strong>safety</strong> — and finds that the answer depends heavily on which language
            the attacker writes in and which tense they use.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, maxWidth: '75ch' }}>
            Llama3-8B-Instruct was evaluated at 23 quantization levels, in English and Korean,
            across past, present and future tense. Every attack success rate reported in the paper
            is published here, down to the individual scenario, so you can check the aggregation
            yourself rather than take the summary on trust.
          </Typography>
        </Section>

        {/* ---------- Findings ---------- */}
        <Section eyebrow="Key findings" title="Four things the data shows">
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            {FINDINGS.map((f) => (
              <Paper key={f.title} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.75rem' }}>
                  {f.stat}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {f.body}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 4, mb: 1 }}>
            Mean attack success rate by language and tense
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: 480, borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell align="right"><strong>English</strong></TableCell>
                  <TableCell align="right"><strong>Korean</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {LANG_TENSE.map(([tense, en, ko]) => (
                  <TableRow key={tense}>
                    <TableCell><strong>{tense}</strong></TableCell>
                    <TableCell align="right">{en}</TableCell>
                    <TableCell align="right">{ko}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell><strong>All tenses</strong></TableCell>
                  <TableCell align="right"><strong>29.0%</strong></TableCell>
                  <TableCell align="right"><strong>51.5%</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', maxWidth: '75ch' }}>
            Computed from all 24 model variants in <code>jailbreak_success_rates.csv</code>. The
            paper’s headline coefficients come from a regression on the 19-model set left after
            outlier removal, so they differ slightly from these raw means.
          </Typography>
        </Section>

        {/* ---------- How to read ---------- */}
        <Section eyebrow="How to read the heatmaps" title="One column per scenario, one row per condition">
          <Typography variant="body1" sx={{ maxWidth: '75ch' }}>
            Every heatmap below shares the same horizontal axis: columns <code>Q1</code>–
            <code>Q100</code> are the 100 harmful-behaviour scenarios from{' '}
            <Link href="https://github.com/JailbreakBench/jailbreakbench" target="_blank" rel="noopener noreferrer">
              JBB-Behaviors
            </Link>
            , in dataset order. Rows change from tab to tab — pooled, by language and tense, by
            quantization level, or the full grid.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, maxWidth: '75ch' }}>
            A blank cell means the model refused every time. Darker or stronger colour means the
            jailbreak succeeded more readily. The scenario prompts themselves are deliberately not
            reproduced here — only the outcomes.
          </Typography>
        </Section>

        {/* ---------- The explorer ---------- */}
        <Box sx={{ mt: 4 }}>
          <JailbreakHeatmap />
        </Box>

        {/* ---------- Method ---------- */}
        <Section eyebrow="Method" title="How the data was produced">
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxWidth: 780 }}>
            <Table size="small">
              <TableBody>
                {SETUP.map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell sx={{ width: 160, fontWeight: 700 }}>{k}</TableCell>
                    <TableCell>{v}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', maxWidth: '75ch' }}>
            Stated plainly, because they bound what these numbers support: the study covers one
            model and one dataset, the judge is itself an LLM and can carry its own bias, and no
            random seed was fixed — so per-scenario outcomes are not bit-reproducible.
          </Typography>
        </Section>

        {/* ---------- Cite ---------- */}
        <Section eyebrow="Reuse" title="Citing this work">
          <Typography variant="body1" sx={{ maxWidth: '75ch' }}>
            The data is published under{' '}
            <Link href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
              CC BY 4.0
            </Link>
            , the same terms as the paper. Use it anywhere, including commercially — the one thing
            asked in return is attribution, which citing the paper satisfies.
          </Typography>
          <Paper
            variant="outlined"
            component="pre"
            sx={{
              mt: 2, p: 2, borderRadius: 2, overflowX: 'auto',
              fontSize: '0.78rem', bgcolor: 'common.white', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
{`@article{lee2025quantization,
  author  = {Lee, Jaesik},
  title   = {Quantization-Based Jailbreaking Vulnerability Analysis:
             A Study on Performance and Safety of the Llama3-8B-Instruct Model},
  journal = {IEEE Access},
  volume  = {13},
  pages   = {136524--136535},
  year    = {2025},
  doi     = {10.1109/ACCESS.2025.3594287}
}`}
          </Paper>
        </Section>

        <Divider sx={{ mt: 7 }} />
        <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
          <Link href={PAPER_URL} target="_blank" rel="noopener noreferrer">Paper</Link>
          {' · '}
          <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">Repository</Link>
          {' · '}
          <Link href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Data: CC BY 4.0</Link>
          {' · '}
          <Link href={`${REPO_URL}/blob/main/LICENSE-CODE`} target="_blank" rel="noopener noreferrer">Code: MIT</Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default App;
