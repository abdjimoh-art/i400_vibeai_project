// Skill tracker detail — the +1 feature. 2 variations.
// V1: Skater-centric checklist (instructor view).
// V2: Level grid / progress board (parent celebration view).

function SkillTrackerV1() {
  return (
    <WFBrowser url="icetrack.app/instructor/skills/emma-mitchell">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: WF.paper }}>
        <div style={{ padding: '10px 22px', borderBottom: `1.5px solid ${WF.ink}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
          <WFLogo size={14} />
          <span style={{ color: WF.muted }}>›</span>
          <span>Tue 4:30 Level 2</span>
          <span style={{ color: WF.muted }}>›</span>
          <span style={{ fontWeight: 700 }}>Emma Mitchell</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="wf-btn" style={{ padding: '4px 10px', fontSize: 11 }}>← Back to roster</button>
            <button className="wf-btn wf-btn-primary" style={{ padding: '4px 10px', fontSize: 11 }}>Save passes</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: 20, overflow: 'auto', display: 'grid', gridTemplateColumns: '270px 1fr', gap: 18 }}>
          {/* Left: skater card */}
          <div>
            <div className="wf-rough" style={{ background: '#fff', padding: 16, boxShadow: '3px 3px 0 ' + WF.ink }}>
              <WFPhoto label="Emma" width={'100%'} height={120} style={{ borderRadius: 4, marginBottom: 10 }} />
              <div className="wf-h2" style={{ fontSize: 22 }}>Emma Mitchell</div>
              <div style={{ fontSize: 12, color: WF.muted }}>Age 7 · Parent: Sarah M.</div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="wf-pill wf-pill-accent">Level 2</span>
                <span className="wf-mono" style={{ fontSize: 11 }}>5/8 passed</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 10, border: `1.5px solid ${WF.ink}`, borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: '62%', height: '100%', background: 'var(--wf-accent)' }} />
                </div>
                <div className="wf-hand" style={{ fontSize: 11, color: WF.muted, marginTop: 4 }}>3 more to advance to Level 3 ✦</div>
              </div>
              <div className="wf-line-soft" style={{ margin: '14px 0' }} />
              <div className="wf-mono" style={{ fontSize: 10, color: WF.muted, marginBottom: 6 }}>ATTENDANCE · LAST 8</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {['✓','✓','✗','✓','✓','✓','✓','—'].map((c, i) => (
                  <div key={i} className="wf-icon" style={{ width: 22, height: 22, fontSize: 11, background: c === '✓' ? WF.green + '33' : c === '✗' ? '#d9775733' : '#fff', color: c === '✓' ? WF.green : c === '✗' ? '#d97757' : WF.muted }}>{c}</div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12, padding: 12, border: `1.5px dashed ${WF.pencil}`, borderRadius: 6, fontFamily: WF.hand, fontSize: 12, color: WF.inkSoft }}>
              ✎ Notes: Working on backward swizzles. Loves the rocking horse drill.
            </div>
          </div>

          {/* Right: skills checklist */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <div className="wf-h1" style={{ fontSize: 24 }}>Level 2 skills</div>
              <span className="wf-hand" style={{ fontSize: 12, color: WF.muted }}>Tap to mark passed today</span>
            </div>
            <div className="wf-box" style={{ background: '#fff', padding: 0 }}>
              {[
                { n: 'Forward skating (width of rink)', s: 'Skate forward with alternating pushes', on: true, when: 'Apr 1' },
                { n: 'One-foot glide (right & left)', s: 'Glide held for 4-6 count', on: true, when: 'Apr 8' },
                { n: 'Forward swizzles (8)', s: 'Eight in a row, glide between each', on: true, when: 'Apr 22 ★' },
                { n: 'Rocking horse (3 sets)', s: 'Forward swizzle + backward swizzle', on: true, when: 'Apr 22' },
                { n: 'Backward swizzles (6)', s: 'Six in a row', on: true, when: 'Apr 15' },
                { n: 'Forward alternating pumps (6)', s: 'Six 1/2 swizzle pumps in straight line', on: false, when: '' },
                { n: 'Snowplow stop (moving)', s: 'Forward then full stop, 3 sec hold', on: false, when: '' },
                { n: 'Two-foot hop', s: 'Small jump in place from standstill', on: false, when: '' },
              ].map((sk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < 7 ? `1px dashed ${WF.pencil}` : 'none', background: sk.when.includes('★') ? 'var(--wf-accent-soft)' : 'transparent' }}>
                  <WFCheck on={sk.on} size={20} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{sk.n}</div>
                    <div style={{ fontSize: 11, color: WF.muted }}>{sk.s}</div>
                  </div>
                  {sk.on ? (
                    <span className="wf-mono" style={{ fontSize: 11, color: WF.muted }}>passed {sk.when}</span>
                  ) : (
                    <button className="wf-btn" style={{ padding: '3px 10px', fontSize: 11 }}>Pass today</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 60, left: 30 }}>
        <WFCallout rotate={-3}>checklist + context = fast</WFCallout>
      </div>
    </WFBrowser>
  );
}

function SkillTrackerV2() {
  return (
    <WFBrowser url="icetrack.app/parent/emma/skills">
      <div style={{ height: '100%', background: WF.paper, padding: 20, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <WFPhoto label="Emma" width={56} height={56} style={{ borderRadius: '50%' }} />
          <div>
            <div className="wf-h1" style={{ fontSize: 28 }}>Emma's skill journey</div>
            <div style={{ fontSize: 12, color: WF.muted }}>Started Parent Tot · Now on Level 2 · 19 skills passed</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="wf-btn" style={{ padding: '5px 12px', fontSize: 12 }}>Print certificate</button>
            <button className="wf-btn wf-btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}>Share ↗</button>
          </div>
        </div>

        {/* Level progress board */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
          {[
            { l: 'Parent Tot', p: 5, t: 5, done: true },
            { l: 'Tot 2', p: 5, t: 5, done: true },
            { l: 'Tot 3', p: 6, t: 6, done: true },
            { l: 'Level 1', p: 11, t: 11, done: true },
            { l: 'Level 2', p: 5, t: 8, current: true },
            { l: 'Level 3', p: 0, t: 5 },
            { l: 'Level 4', p: 0, t: 7 },
            { l: 'Level 5', p: 0, t: 7 },
          ].map((lv, i) => (
            <div key={i} className="wf-box" style={{
              padding: 12, background: lv.done ? WF.green + '22' : lv.current ? 'var(--wf-accent-soft)' : '#fff',
              borderColor: lv.done ? WF.green : lv.current ? 'var(--wf-accent)' : WF.ink,
              borderStyle: !lv.done && !lv.current ? 'dashed' : 'solid',
              opacity: !lv.done && !lv.current ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="wf-h2" style={{ fontSize: 14 }}>{lv.l}</div>
                {lv.done && <span style={{ fontSize: 16 }}>🏅</span>}
                {lv.current && <span className="wf-pill wf-pill-accent" style={{ fontSize: 9, padding: '1px 6px' }}>NOW</span>}
              </div>
              <div className="wf-mono" style={{ fontSize: 11, marginTop: 6, color: WF.muted }}>{lv.p}/{lv.t}</div>
              <div style={{ height: 6, border: `1px solid ${WF.ink}`, borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ width: lv.t ? `${lv.p / lv.t * 100}%` : '0%', height: '100%', background: lv.done ? WF.green : 'var(--wf-accent)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Current focus */}
        <div className="wf-rough" style={{ background: '#fff', padding: 16, boxShadow: '3px 3px 0 ' + WF.ink, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>CURRENT FOCUS</div>
              <div className="wf-h1" style={{ fontSize: 22 }}>Level 2 · 3 to go!</div>
            </div>
            <WFRibbon color={WF.green}>NEW PASS — APR 22</WFRibbon>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { n: 'Forward skating', on: true },
              { n: 'One-foot glide', on: true },
              { n: 'Forward swizzles (8)', on: true, fresh: true },
              { n: 'Rocking horse (3 sets)', on: true },
              { n: 'Backward swizzles (6)', on: true },
              { n: 'Alternating pumps (6)', on: false },
              { n: 'Snowplow stop (moving)', on: false },
              { n: 'Two-foot hop', on: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', border: `1.5px ${s.on ? 'solid' : 'dashed'} ${s.fresh ? 'var(--wf-accent)' : s.on ? WF.green : WF.pencil}`, borderRadius: 5, background: s.fresh ? 'var(--wf-accent-soft)' : s.on ? WF.green + '12' : 'transparent' }}>
                <WFCheck on={s.on} size={16} />
                <span style={{ fontSize: 12, fontWeight: s.fresh ? 700 : 400 }}>{s.n}</span>
                {s.fresh && <span className="wf-callout" style={{ fontSize: 12, marginLeft: 'auto' }}>✦ new!</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Coach notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="wf-box" style={{ padding: 12, background: '#fff' }}>
            <div className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>FROM COACH MAYA</div>
            <div className="wf-hand" style={{ fontSize: 14, marginTop: 4, lineHeight: 1.4 }}>
              "Emma's swizzles looked great today — the glide between each is much more controlled. Working on slalom pumps next week."
            </div>
            <div style={{ fontSize: 10, color: WF.muted, marginTop: 6 }}>Apr 22 · Tue Level 2</div>
          </div>
          <div className="wf-box" style={{ padding: 12, background: '#fff' }}>
            <div className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>NEXT MILESTONE</div>
            <div className="wf-h2" style={{ fontSize: 16, marginTop: 4 }}>Advance to Level 3</div>
            <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 4 }}>3 skills remaining: pumps, snowplow stop, two-foot hop.</div>
            <div className="wf-callout" style={{ marginTop: 6, fontSize: 13 }}>est. 2-3 weeks ✦</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 80, right: 30 }}>
        <WFCallout rotate={4}>parent celebration view ↘</WFCallout>
      </div>
    </WFBrowser>
  );
}

Object.assign(window, { SkillTrackerV1, SkillTrackerV2 });
