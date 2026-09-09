import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Typography, Tabs, Tab, Box, Table, TableBody, TableCell, TableHead, TableRow, Link } from '@mui/material';
import Papa from 'papaparse';

// Hue in the ratio heatmaps encodes column position, not value — these are its keys.
const COLUMN_BLOCKS = [
  ['#ff0000', 'Q1–Q10'], ['#ff8c00', 'Q11–Q20'], ['#ffd700', 'Q21–Q30'],
  ['#32cd32', 'Q31–Q40'], ['#00ff7f', 'Q41–Q50'], ['#00ffff', 'Q51–Q60'],
  ['#0000ff', 'Q61–Q70'], ['#8a2be2', 'Q71–Q80'], ['#ff00ff', 'Q81–Q90'],
  ['#ff1493', 'Q91–Q100'],
];

const Swatch = ({ color, outlined }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-block', width: '0.75rem', height: '0.75rem',
      bgcolor: color, verticalAlign: 'middle', mr: 0.5, ml: 1,
      border: outlined ? '1px solid #cbd5e1' : 'none',
    }}
  />
);

const Legend = ({ children }) => (
  <Typography variant="caption" component="div" align="center" sx={{ lineHeight: 2 }}>
    {children}
  </Typography>
);

const LegendNote = ({ children }) => (
  <Typography variant="caption" component="p" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
    {children}
  </Typography>
);

// What each tab shows, in the tab order below.
const TAB_INFO = [
  {
    rows: '1 row',
    blurb: 'Everything pooled. Each cell is how often that scenario jailbroke across all 24 model variants, both languages and all three tenses.',
    file: 'tf_ratios/overall_tf_ratio.csv',
  },
  {
    rows: '6 rows',
    blurb: 'The two languages crossed with the three tenses. This is where the English/Korean and past/present gaps become visible at a glance.',
    file: 'tf_ratios/combined_tense_tf_ratio.csv',
  },
  {
    rows: '24 rows',
    blurb: 'One row per quantization level, averaged over languages and tenses. Rows are ordered from the bf16 baseline down to 1-bit.',
    file: 'tf_ratios/quantization_average_ratio.csv',
  },
  {
    rows: '48 rows',
    blurb: 'Quantization crossed with language. Each cell is the share of the three tenses that jailbroke, so values land on 0 / 33 / 67 / 100.',
    file: 'tf_ratios/combined_quantization_tf_ratio.csv',
  },
  {
    rows: '144 rows',
    blurb: 'The full grid. Colour encodes which of the 20 attempts first succeeded — darker means the model gave in sooner. Blank means it never did.',
    file: 'tf_ratios/combined_quantization_tense_tf_ratio.csv',
  },
  {
    rows: '144 rows',
    blurb: 'The raw outcome behind everything above: green if that scenario was jailbroken at least once in 20 attempts.',
    file: 'jailbreak_success_rates.csv',
  },
];

const JailbreakHeatmap = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [dataSets, setDataSets] = useState({
    tf_ratio1: [],
    tf_ratio2: [],
    quant_asr: [],
    tf_ratio3: [],
    tf_ratio4: [],
    success_rates: [],
  });
  const [csvSample, setCsvSample] = useState([]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // 탭 변경 시 해당 데이터로 샘플 업데이트
    switch (newValue) {
      case 0:
        setCsvSample(dataSets.tf_ratio1);
        break;
      case 1:
        setCsvSample(dataSets.tf_ratio2);
        break;
      case 2:
        setCsvSample(dataSets.quant_asr);
        break;
      case 3:
        setCsvSample(dataSets.tf_ratio3);
        break;
      case 4:
        setCsvSample(dataSets.tf_ratio4);
        break;
      case 5:
        setCsvSample(dataSets.success_rates);
        break;
      default:
        setCsvSample([]);
    }
  };

  useEffect(() => {
    const fetchCSV = (path) => {
      return new Promise((resolve, reject) => {
        Papa.parse(path, {
          download: true,
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          complete: (results) => {
            const processedData = results.data.map(row => {
              const newRow = {};
              Object.keys(row).forEach(key => {
                const cleanKey = key.trim();
                newRow[cleanKey] = row[key];
              });
              return newRow;
            });
            resolve(processedData);
          },
          error: (err) => {
            reject(err);
          },
        });
      });
    };

    const loadData = async () => {
      try {
        const [tf1, tf2, quantAsr, tf3, tf4, success] = await Promise.all([
          fetchCSV('/data/tf_ratios/overall_tf_ratio.csv'),
          fetchCSV('/data/tf_ratios/combined_tense_tf_ratio.csv'),
          fetchCSV('/data/tf_ratios/quantization_average_ratio.csv'),
          fetchCSV('/data/tf_ratios/combined_quantization_tf_ratio.csv'),
          fetchCSV('/data/tf_ratios/combined_quantization_tense_tf_ratio.csv'),
          fetchCSV('/data/jailbreak_success_rates.csv'),
        ]);
        setDataSets({
          tf_ratio1: tf1,
          tf_ratio2: tf2,
          quant_asr: quantAsr,
          tf_ratio3: tf3,
          tf_ratio4: tf4,
          success_rates: success,
        });
        setCsvSample(tf1);
      } catch (error) {
        console.error('Error loading CSV data:', error);
      }
    };

    loadData();
  }, []);

  const getColorForValue = (value, type, qIndex) => {
    if (type === 'success') {
      if (value === 'F') return '#ffffff';
      if (value === 'T') return '#4caf50';
      return '#e0e0e0';
    } else {
      // 4번째 탭인 Quant-Tense의 색상 표현 변경
      if (selectedTab === 4) {
        if (value === -1) {
          return '#FFFFFF'; // 하얀색
        } else if (value === 0) {
          return '#0D47A1'; // 가장 진한 색 (다크 블루)
        } else if (value === 19) {
          return '#E3F2FD'; // 가장 연한 색 (라이트 블루)
        } else if (value >= 1 && value <= 18) {
          // 1~18 값에 따라 색상 농도 조절
          const colorScale = [
            '#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3',
            '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB', '#C5CAE9',
            '#9FA8DA', '#7986CB', '#5C6BC0', '#3F51B5', '#3949AB',
            '#303F9F', '#283593', '#1A237E'
          ];
          return colorScale[value - 1];
        } else {
          return '#FFFFFF'; // 기본적으로 하얀색
        }
      }

      if (value === 0) return '#ffffff'; // 실패: 하얀색

      // q1-q100을 10개 구간으로 나누어 색상 지정
      const colorGroups = [
        '#ff0000', // 빨강 (q1-q10)
        '#ff8c00', // 다크 오렌지 (q11-q20)
        '#ffd700', // 골드 (q21-q30)
        '#32cd32', // 라임그린 (q31-q40)
        '#00ff7f', // 스프링그린 (q41-q50)
        '#00ffff', // 시안 (q51-q60)
        '#0000ff', // 블루 (q61-q70)
        '#8a2be2', // 블루바이올렛 (q71-q80)
        '#ff00ff', // 마젠타 (q81-q90)
        '#ff1493', // 딥핑크 (q91-q100)
      ];

      const groupIndex = Math.floor(qIndex / 10);
      const baseColor = colorGroups[groupIndex] || '#ffffff';

      // 값에 따라 색상 농도 조절 (높은 값일수록 진한 색)
      // 기존 1~100 범위에 대한 색상 조절
      const opacity = value / 100;
      return `${baseColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
    }
  };

  // Tab 4 stores a retry index (0-19, -1 = never), every other ratio tab a percentage.
  const cellTooltip = (index, value, displayValue, type) => {
    const q = `Q${index + 1}`;
    if (type === 'success') {
      return `${q} — ${value === 'T' ? 'jailbroken at least once' : 'refused all 20 attempts'}`;
    }
    if (selectedTab === 4) {
      return displayValue === -1
        ? `${q} — never jailbroken`
        : `${q} — jailbroken on attempt ${displayValue + 1} of 20`;
    }
    return `${q} — jailbroken in ${displayValue}% of runs`;
  };

  const renderHeatmap = (data, type = 'ratio') => {
    const qKeys = Array.from({ length: 100 }, (_, i) => `q${i + 1}`);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ 
                width: selectedTab === 5 ? '10rem' :  // T/F Maps
                       selectedTab === 4 ? '7rem' :   // Quant-Tense
                       selectedTab === 3 ? '7rem' :   // Quant-Lang
                       selectedTab === 2 ? '7rem' :   // Quant-ASR
                       '3rem',                        // 기본값
                height: '2rem', 
                textAlign: 'right', 
                paddingRight: '1rem', 
                fontSize: '0.7rem', 
                whiteSpace: 'nowrap' 
              }}>Condition</th>
              {/* q1 ~ q100 라벨 추가 */}
              {qKeys.map((key, i) => (
                <th key={i} style={{ width: '0.5rem', padding: '0.25rem', fontSize: '0.5rem', transform: 'rotate(-45deg)', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>
                  {key.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td style={{ 
                  fontFamily: 'monospace', 
                  fontSize: (selectedTab === 4 || selectedTab === 5) ? '0.6rem' : '0.7rem',
                  fontWeight: '500', 
                  textAlign: 'right', 
                  paddingRight: '1rem',
                  whiteSpace: selectedTab === 5 ? 'nowrap' : 'normal',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {selectedTab === 2 
                    ? <>{row.Quan || ''} <span style={{ color: '#FF0000', fontWeight: 'bold' }}>{row.ASR || ''}</span></>
                    : selectedTab === 4 
                      ? `${row.Quan || ''} ${row.Lang || ''} ${row.Tens || ''}` 
                      : row.All || 
                        (row.Quan ? `${row.Quan} ${row.Lang}` : 
                        (row.Tens ? `${row.Tens} ${row.Lang}` : row.Lang)) || 
                        `${row.experiment_number} ${row.target_model} ${row.tense}`
                  }
                </td>
                {qKeys.map((qKey, index) => {
                  const value = row[qKey];
                  if (typeof value === 'undefined') return null;
                  const displayValue = type === 'success' ? value : parseFloat(value);
                  const color = getColorForValue(displayValue, type, index);
                  return (
                    <td key={index} style={{ padding: 0 }}>
                      <div
                        style={{
                          width: '100%',
                          height: '0.75rem',
                          backgroundColor: color,
                          border: '1px solid #e2e8f0',
                          transition: 'background-color 0.2s',
                        }}
                        title={cellTooltip(index, value, displayValue, type)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ maxWidth: 760 }}>
            {type === 'success' ? (
              <>
                <Legend>
                  <Swatch color="#ffffff" outlined /> refused all 20 attempts
                  <Swatch color="#4caf50" /> jailbroken at least once
                </Legend>
                <LegendNote>
                  Each cell is one scenario under one condition — the raw outcome every other tab aggregates.
                </LegendNote>
              </>
            ) : selectedTab === 4 ? (
              <>
                <Legend>
                  <Swatch color="#ffffff" outlined /> never jailbroken
                  <Swatch color="#0D47A1" /> gave in on attempt 1
                  <Swatch color="#7986CB" /> …
                  <Swatch color="#E3F2FD" /> held out to attempt 20
                </Legend>
                <LegendNote>
                  Colour depth is <em>how soon</em> the model gave in, not how often. Darker means it broke
                  on an earlier attempt.
                </LegendNote>
              </>
            ) : (
              <>
                <Legend>
                  <Swatch color="#ffffff" outlined /> never jailbroken (0%)
                  {COLUMN_BLOCKS.map(([color, label]) => (
                    <React.Fragment key={label}>
                      <Swatch color={color} /> {label}
                    </React.Fragment>
                  ))}
                </Legend>
                <LegendNote>
                  Hue only marks which block of columns a cell sits in — it carries no value. The{' '}
                  <strong>strength of the colour is the jailbreak rate</strong>: faint is close to 0%,
                  fully saturated is 100%.
                </LegendNote>
              </>
            )}
          </Box>
        </Box>
      </div>
    );
  };

  const { tf_ratio1, tf_ratio2, quant_asr, tf_ratio3, tf_ratio4, success_rates } = dataSets;

  return (
    <Card sx={{ width: '100%' }} id="explore">
      <CardHeader
        title={<Typography variant="h6" component="h2">Explore the data</Typography>}
        subheader={
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Six views of the same experiment grid, from fully pooled down to one cell per scenario.
            Every column <code>Q1</code>–<code>Q100</code> is a JBB-Behaviors scenario.
          </Typography>
        }
      />
      <CardContent>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          centered
        >
          <Tab label="Total ASR" />
          <Tab label="Lang-Tense" />
          <Tab label="Quant-ASR" />
          <Tab label="Quant-Lang" />
          <Tab label="Quant-Tense" />
          <Tab label="T/F Maps" />
        </Tabs>
        <Box
          sx={{
            mt: 2, px: 2, py: 1.5,
            bgcolor: 'grey.50',
            borderLeft: '3px solid', borderColor: 'primary.main',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <strong>{TAB_INFO[selectedTab].rows}</strong> — {TAB_INFO[selectedTab].blurb}
            {' '}
            <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.8rem' }}>
              Source:{' '}
              <Link href={`/data/${TAB_INFO[selectedTab].file}`} target="_blank" rel="noopener noreferrer">
                <code>{TAB_INFO[selectedTab].file}</code>
              </Link>
            </Box>
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          {selectedTab === 0 && renderHeatmap(tf_ratio1, 'ratio')}
          {selectedTab === 1 && renderHeatmap(tf_ratio2, 'ratio')}
          {selectedTab === 2 && renderHeatmap(quant_asr, 'ratio')}
          {selectedTab === 3 && renderHeatmap(tf_ratio3, 'ratio')}
          {selectedTab === 4 && renderHeatmap(tf_ratio4, 'ratio')}
          {selectedTab === 5 && renderHeatmap(success_rates, 'success')}
        </Box>
        {/* CSV 전체 데이터 표시 */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            The numbers behind this view
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Every row of{' '}
            <Link href={`/data/${TAB_INFO[selectedTab].file}`} target="_blank" rel="noopener noreferrer">
              <code>{TAB_INFO[selectedTab].file}</code>
            </Link>
            , exactly as published — scroll sideways for all 100 scenarios.
          </Typography>
          <div style={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {csvSample[0] && Object.keys(csvSample[0]).map((key) => (
                    <TableCell
                      key={key}
                      style={{
                        fontSize: '0.65rem',
                        padding: '2px',
                        ...(key === 'target_model' ? { width: '10rem', whiteSpace: 'nowrap' } : {})
                      }}
                    >
                      {key}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {csvSample.map((row, index) => (
                  <TableRow key={index}>
                    {Object.entries(row).map(([key, value], idx) => (
                      <TableCell
                        key={idx}
                        style={{
                          fontSize: '0.65rem',
                          padding: '2px',
                          ...(key === 'target_model' ? { width: '10rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : {})
                        }}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JailbreakHeatmap;