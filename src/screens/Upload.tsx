import { useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Dropzone } from '../components/Dropzone';
import { openSampleReport } from '../sampleReport';

export function Upload() {
  const { setScreen, setFile, file, setParsing, setProgress, clearLiveFindings, setParseError } = useAppStore();
  const [pickedFile, setPickedFile] = useState<File | null>(file);
  const [validated, setValidated] = useState(false);

  const handleFile = useCallback((f: File) => {
    setPickedFile(f);
    setValidated(true);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!pickedFile) return;
    const selectedFile = pickedFile;
    setFile(selectedFile);
    setParsing(true);
    setProgress(0);
    setParseError(null);
    clearLiveFindings();
    setScreen('processing');

    const formData = new FormData();
    formData.append('file', selectedFile);

    fetch('/api/parse', { method: 'POST', body: formData })
      .then(response => {
        if (!response.body) {
          throw new Error('The local analysis server returned an empty response.');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let terminalEventReceived = false;

        function processChunk() {
          reader.read().then(({ done, value }) => {
            if (done) {
              if (!terminalEventReceived) {
                const message = 'Connection closed before the analysis finished.';
                const state = useAppStore.getState();
                state.setParseError(message);
                state.setParsedData(null);
                state.setRawTransactions([]);
                state.addLiveFinding({
                  id: crypto.randomUUID(),
                  icon: 'X',
                  text: message,
                });
                state.setParsing(false);
                state.setProgress(100);
                setTimeout(() => state.setScreen('insights'), 500);
              }
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const evt = JSON.parse(line.slice(6));

                if (evt.type === 'progress') {
                  useAppStore.getState().setProgress(evt.pct ?? evt.value ?? 0);
                  if (evt.message) {
                    useAppStore.getState().addLiveFinding({
                      id: crypto.randomUUID(),
                      icon: '...',
                      text: evt.message,
                    });
                  }
                } else if (evt.type === 'insight') {
                  useAppStore.getState().addLiveFinding({
                    id: crypto.randomUUID(),
                    icon: evt.icon || 'i',
                    text: evt.text,
                  });
                } else if (evt.type === 'done') {
                  terminalEventReceived = true;
                  useAppStore.getState().setParseError(null);
                  useAppStore.getState().setParsedData(evt.data || null);
                  useAppStore.getState().setRawTransactions(evt.transactions || []);
                  if (evt.data && evt.transactions) {
                    useAppStore.getState().upsertStatementRecord(selectedFile.name, evt.transactions, evt.data);
                  }
                  useAppStore.getState().setParsing(false);
                  useAppStore.getState().setProgress(100);
                  setTimeout(() => useAppStore.getState().setScreen('insights'), 1000);
                } else if (evt.type === 'error') {
                  terminalEventReceived = true;
                  useAppStore.getState().setParseError(evt.error || 'Parsing failed');
                  useAppStore.getState().setParsedData(null);
                  useAppStore.getState().setRawTransactions([]);
                  useAppStore.getState().addLiveFinding({
                    id: crypto.randomUUID(),
                    icon: 'X',
                    text: evt.error || 'Parsing failed',
                  });
                  useAppStore.getState().setParsing(false);
                  useAppStore.getState().setProgress(100);
                  setTimeout(() => useAppStore.getState().setScreen('insights'), 500);
                }
              } catch {
                // skip malformed event chunks
              }
            }
            processChunk();
          });
        }
        processChunk();
      })
      .catch((error: Error) => {
        useAppStore.getState().setParseError(error.message || 'Failed to connect to the local analysis server.');
        useAppStore.getState().setParsedData(null);
        useAppStore.getState().setRawTransactions([]);
        useAppStore.getState().addLiveFinding({
          id: crypto.randomUUID(),
          icon: 'X',
          text: 'Failed to connect to the analysis server.',
        });
        useAppStore.getState().setParsing(false);
        useAppStore.getState().setProgress(100);
        setTimeout(() => useAppStore.getState().setScreen('insights'), 500);
      });
  }, [pickedFile, setFile, setParsing, setProgress, clearLiveFindings, setScreen, setParseError]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar showBack step="Step 1 of 3" />

      <div className="screen" style={{ flex: 1 }}>
        <div className="upload-layout" style={{ display: 'grid', gap: 32, alignItems: 'start' }}>
          <div>
            {!pickedFile ? (
              <>
                <h1 className="h1" style={{ marginBottom: 6, fontSize: 28 }}>Drop your statement.</h1>
                <p className="hand sub" style={{ fontSize: 14, marginBottom: 20 }}>
                  Works with exported bank PDFs and expense statements. If the file is sparse or incomplete, the final health check will say so clearly.
                </p>
                <Dropzone onFile={handleFile} />
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <Button variant="ghost" size="sm" onClick={openSampleReport}>
                    Try with sample data
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h1 className="h1" style={{ fontSize: 24, marginBottom: 14 }}>Ready for a money health check?</h1>

                <Card style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <div style={{
                    width: 46, height: 58, border: '1.5px solid rgba(128,128,128,0.3)', borderRadius: 4,
                    background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0
                  }}>
                    <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, stroke: 'var(--blue)', fill: 'none', strokeWidth: 1.5 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {pickedFile.name}
                    </div>
                    <div className="sub" style={{ fontSize: 11 }}>
                      {(pickedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                  <button
                    onClick={() => { setPickedFile(null); setValidated(false); }}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer', padding: 4 }}
                    aria-label="Remove file"
                  >
                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </Card>

                {validated && (
                  <Card style={{ padding: '10px 12px', background: 'rgba(43,147,72,0.1)', borderColor: 'var(--ok)', marginBottom: 10 }}>
                    <div className="row" style={{ gap: 6, fontSize: 12, color: 'var(--ok)' }}>
                      <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2.5 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <b>Statement attached and ready for analysis</b>
                    </div>
                  </Card>
                )}

                <div style={{ background: 'var(--paper-2)', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                  <div className="h3" style={{ fontSize: 10, marginBottom: 8 }}>How the diagnosis works</div>
                  <div className="sub" style={{ fontSize: 12, lineHeight: 1.5 }}>
                    We estimate score drivers, recurring charges, and likely spending pressure from the transactions we can parse. If income must be inferred or the statement is too thin, the final report will lower its confidence and say why.
                  </div>
                </div>

                <Button size="wide" onClick={handleAnalyze}>Analyze -&gt;</Button>
                <div className="sub" style={{ textAlign: 'center', fontSize: 10, marginTop: 8 }}>
                  Analyzed by the local FixMyFinance app on your machine. Nothing is sent to a cloud service.
                </div>
              </>
            )}
          </div>

          <div className="desktop-only col" style={{ gap: 12 }}>
            <Card style={{ padding: 16 }}>
              <div className="h3" style={{ marginBottom: 8 }}>
                <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: 'var(--ok)', fill: 'none', strokeWidth: 2, display: 'inline', marginRight: 6 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Privacy - local app only
              </div>
              <div className="hand" style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.4 }}>
                Your file is analyzed by the FixMyFinance backend running on your machine, not uploaded to a remote service.
              </div>
            </Card>
            <Card style={{ padding: 16 }}>
              <div className="h3" style={{ marginBottom: 10 }}>What the report will surface</div>
              <div className="col" style={{ gap: 8 }}>
                {['How reliable the diagnosis is', 'What is helping your money health', 'What is hurting it most', 'Which assumption was made, if any', 'The clearest next action to take'].map((item, i) => (
                  <div key={i} className="row" style={{ gap: 10, fontSize: 13 }}>
                    <span style={{ color: 'var(--blue)', fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 11 }}>0{i + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </Card>
            <Card variant="hero-ink" style={{ padding: 16 }}>
              <div className="h3" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>New here?</div>
              <div className="hand" style={{ fontSize: 14, lineHeight: 1.4, color: 'var(--paper)' }}>
                No account. No trust needed. <b style={{ color: '#fff' }}>Nothing leaves your machine.</b>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .upload-layout { grid-template-columns: 1.3fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
