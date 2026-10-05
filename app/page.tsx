'use client';

import { useEffect } from 'react';

import { useState } from 'react';
import { lessons, stages } from '@/lib/lesson/data';
import { Studio } from '@/components/Studio';

type View = 'home' | 'lessons' | 'lesson' | 'studio' | 'projects' | 'review' | 'settings';

export default function Home() {
  useEffect(() => { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined); }, []);
  const [view, setView] = useState<View>('home');
  const [lessonId, setLessonId] = useState(lessons[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [lessonTab, setLessonTab] = useState('すべて');
  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0];
  const done = (id: string) => completed.includes(id);
  const finishLesson = () => setCompleted((old) => old.includes(lesson.id) ? old : [...old, lesson.id]);
  const openLesson = (id: string) => { setLessonId(id); setView('lesson'); };
  const nav = (id: View) => setView(id);
  const stageCounts = stages.map((stage) => ({ ...stage, items: lessons.filter((item) => item.stage === stage.id) }));
  const filteredLessons = lessonTab === 'すべて' ? lessons : lessons.filter((item) => item.category === lessonTab);

  return <main className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => nav('home')} aria-label="Atelier ホーム"><span className="brand-mark"><span /></span><span className="brand-name">atelier<span className="brand-dot">.</span><small>ILLUSTRATION STUDIO</small></span></button>
      <div className="nav-label">LEARN</div>
      <nav className="primary-nav">
        <button className={view === 'home' ? 'active' : ''} onClick={() => nav('home')}><span className="nav-icon">⌂</span>ホーム</button>
        <button className={view === 'lessons' || view === 'lesson' ? 'active' : ''} onClick={() => nav('lessons')}><span className="nav-icon">▤</span>レッスン</button>
        <button className={view === 'studio' ? 'active' : ''} onClick={() => nav('studio')}><span className="nav-icon">✎</span>キャンバス</button>
        <button className={view === 'projects' ? 'active' : ''} onClick={() => nav('projects')}><span className="nav-icon">▧</span>マイ作品</button>
      </nav>
      <div className="nav-label nav-label-lower">YOUR SPACE</div>
      <nav className="primary-nav">
        <button className={view === 'review' ? 'active' : ''} onClick={() => nav('review')}><span className="nav-icon">↗</span>ふりかえり</button>
        <button className={view === 'settings' ? 'active' : ''} onClick={() => nav('settings')}><span className="nav-icon">⚙</span>設定</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="tiny-spark">✴</div><p>じぶんのペースで<br />描くことを楽しもう。</p>
        <span className="local-pill"><i /> この端末に保存</span>
      </div>
    </aside>

    <section className="main-column">
      <header className="topbar">
        <div className="breadcrumb">{view === 'studio' ? 'マイ作品　/　キャンバス' : view === 'lesson' ? 'レッスン　/　学んでみよう' : 'あなたのアトリエ'}</div>
        <div className="top-actions"><span className="streak"><span>✳</span> {completed.length ? `${completed.length} レッスン完了` : '今日からはじめよう'}</span><button className="avatar" aria-label="プロフィール">あ</button></div>
      </header>
      {view === 'studio' ? <Studio onBack={() => nav('home')} /> : view === 'lesson' ? <LessonPage lesson={lesson} complete={done(lesson.id)} onBack={() => nav('lessons')} onComplete={() => { finishLesson(); nav('lessons'); }} onDraw={() => nav('studio')} /> : view === 'lessons' ? <LessonLibrary stages={stageCounts} completed={completed} tab={lessonTab} setTab={setLessonTab} open={openLesson} /> : view === 'projects' ? <Projects onNew={() => nav('studio')} /> : view === 'review' ? <Review completed={completed} open={() => nav('lessons')} /> : view === 'settings' ? <Settings /> : <Dashboard completed={completed} openLesson={openLesson} openStudio={() => nav('studio')} openLessons={() => nav('lessons')} stages={stageCounts} />}
    </section>
  </main>;
}

function Dashboard({ completed, openLesson, openStudio, openLessons, stages }: { completed: string[]; openLesson: (id: string) => void; openStudio: () => void; openLessons: () => void; stages: (typeof stages[number] & { items: typeof lessons })[] }) {
  const nextLesson = lessons.find((item) => !completed.includes(item.id)) ?? lessons[0];
  return <div className="page-content dashboard">
    <div className="welcome-row"><div><span className="eyebrow">YOUR CREATIVE JOURNEY</span><h1>こんにちは、<em>あたらしい一枚</em>を<br className="desktop-break" />描いてみませんか？</h1><p className="welcome-copy">小さな一歩を重ねて、自分だけの絵に出会う場所。</p></div><div className="welcome-illustration" aria-hidden="true"><div className="sun-orbit" /><div className="paper-shape"><span className="shape-sun" /><span className="shape-mountain" /><span className="shape-hill" /></div><span className="orbit-star star-one">✳</span><span className="orbit-star star-two">✦</span><span className="orbit-star star-three">·</span></div></div>
    <div className="quick-actions"><button className="quick-card draw-card" onClick={openStudio}><span className="quick-icon draw-icon">✎</span><span><b>自由に描く</b><small>キャンバスをひらく</small></span><span className="quick-arrow">↗</span></button><button className="quick-card lesson-card" onClick={() => openLesson(nextLesson.id)}><span className="quick-icon lesson-icon">▤</span><span><b>レッスンをつづける</b><small>{nextLesson.title}</small></span><span className="quick-arrow">↗</span></button></div>
    <div className="section-heading"><div><span className="eyebrow">A LITTLE, EVERY DAY</span><h2>今日のレッスン</h2></div><button className="text-link" onClick={openLessons}>すべてのレッスン <span>→</span></button></div>
    <button className="featured-lesson" onClick={() => openLesson(nextLesson.id)}><div className="featured-art"><div className="feature-sun"/><div className="feature-plant"><i/><i/><i/><b/></div><div className="feature-table"/></div><div className="featured-copy"><div className="tag-row"><span className="tag">STAGE {String(nextLesson.stage).padStart(2,'0')}</span><span className="tag muted-tag">{nextLesson.category}</span></div><h3>{nextLesson.title}</h3><p>{nextLesson.objective}</p><div className="lesson-meta"><span>◷ {nextLesson.duration}</span><span>✳ はじめてでも大丈夫</span></div></div><div className="featured-go">→</div></button>
    <div className="section-heading stage-heading"><div><span className="eyebrow">YOUR LEARNING PATH</span><h2>学びのステージ</h2></div><span className="muted-count">{completed.length} / {lessons.length} レッスン</span></div>
    <div className="stage-grid">{stages.map((stage) => <div key={stage.id} className={`stage-card ${stage.color}`}><span className="stage-icon">{stage.icon}</span><div><span className="stage-num">STAGE {String(stage.id).padStart(2,'0')}</span><h3>{stage.name}</h3><p>{stage.subtitle}</p></div>{stage.items.length > 0 ? <span className="stage-state">{stage.items.filter((item) => completed.includes(item.id)).length}/{stage.items.length} ✓</span> : <span className="stage-lock">· · ·</span>}</div>)}</div>
    <footer className="page-footer">ひとつずつ、自分のペースで。 <span>✳</span></footer>
  </div>;
}

function LessonLibrary({ stages, completed, tab, setTab, open }: { stages: (typeof stages[number] & { items: typeof lessons })[]; completed: string[]; tab: string; setTab: (value: string) => void; open: (id: string) => void }) {
  const categories = ['すべて', ...Array.from(new Set(lessons.map((item) => item.category)))];
  const items = tab === 'すべて' ? lessons : lessons.filter((item) => item.category === tab);
  return <div className="page-content library-page"><span className="eyebrow">YOUR LEARNING PATH</span><h1>レッスン</h1><p className="library-intro">描きながら、少しずつ。気になるところからはじめてみましょう。</p><div className="progress-banner"><div className="progress-icon">✳</div><div><b>あなたのペースで進めよう</b><span>{completed.length} / {lessons.length} レッスンを完了</span></div><div className="progress-track"><i style={{ width: `${lessons.length ? completed.length / lessons.length * 100 : 0}%` }}/></div></div><div className="filter-row">{categories.map((item) => <button key={item} onClick={() => setTab(item)} className={tab === item ? 'filter-chip selected' : 'filter-chip'}>{item}</button>)}</div><div className="lesson-list">{items.map((item, index) => <button className="lesson-row" key={item.id} onClick={() => open(item.id)}><span className={`lesson-row-art art-${index % 4}`}>{['✳','◯','▱','◇'][index % 4]}</span><span className="lesson-row-copy"><span className="tag">STAGE {String(item.stage).padStart(2,'0')}　·　{item.category}</span><b>{item.title}</b><small>{item.objective}</small></span><span className="lesson-row-end">{completed.includes(item.id) ? <span className="completed-mark">✓ 完了</span> : <span>◷ {item.duration}</span>}<b>→</b></span></button>)}</div><div className="section-heading stage-heading"><div><span className="eyebrow">ALL THE WAY THROUGH</span><h2>ステージ一覧</h2></div></div><div className="stage-grid">{stages.map((stage) => <div key={stage.id} className={`stage-card ${stage.color}`}><span className="stage-icon">{stage.icon}</span><div><span className="stage-num">STAGE {String(stage.id).padStart(2,'0')}</span><h3>{stage.name}</h3><p>{stage.items.length ? `${stage.items.length} レッスン` : stage.subtitle}</p></div></div>)}</div></div>;
}

function LessonPage({ lesson, complete, onBack, onComplete, onDraw }: { lesson: typeof lessons[number]; complete: boolean; onBack: () => void; onComplete: () => void; onDraw: () => void }) {
  const [hint, setHint] = useState(0);
  const [reflection, setReflection] = useState('');
  return <div className="page-content lesson-page"><button className="back-link" onClick={onBack}>← レッスン一覧へ</button><div className="lesson-hero"><div className="lesson-hero-meta"><span className="tag">STAGE {String(lesson.stage).padStart(2,'0')}</span><span className="tag muted-tag">{lesson.category}</span><span className="lesson-time">◷ {lesson.duration}</span></div><h1>{lesson.title}</h1><p>{lesson.objective}</p><div className="lesson-hero-art"><span className="hero-art-circle"/><span className="hero-art-line"/><span className="hero-art-square"/><span className="hero-art-star">✳</span></div></div><div className="lesson-columns"><article className="lesson-main"><section className="lesson-section"><span className="step-kicker"><i>01</i> まずは知る</span><h2>今日のヒント</h2><p>{lesson.explanation}</p><div className="thinking-card"><span>考えてみよう</span><p>{lesson.question}</p></div></section><section className="lesson-section"><span className="step-kicker"><i>02</i> 手を動かす</span><h2>練習してみよう</h2><p>{lesson.task}</p><button className="start-drawing" onClick={onDraw}><span>✎</span>キャンバスで描いてみる <b>→</b></button></section><section className="lesson-section"><span className="step-kicker"><i>03</i> じぶんの作品へ</span><h2>小さなミッション</h2><div className="mission-card"><span className="mission-icon">✳</span><p>{lesson.mission}</p></div></section><section className="lesson-section"><span className="step-kicker"><i>04</i> ふりかえる</span><h2>やってみてどうだった？</h2><p>上手・下手ではなく、気づいたことを残しておきましょう。</p><div className="reflection-options">{['楽しかった','気づきがあった','もう少し練習したい'].map((item) => <button key={item} onClick={() => setReflection(item)} className={reflection === item ? 'selected' : ''}>{item}</button>)}</div><label className="reflection-label">ひとことメモ <textarea value={reflection === '楽しかった' || reflection === '気づきがあった' || reflection === 'もう少し練習したい' ? '' : reflection} onChange={(event) => setReflection(event.target.value)} placeholder="描いてみて気づいたことを自由に書いてみよう" /></label><button className="complete-button" onClick={onComplete}>{complete ? 'レッスン完了済み ✓' : 'レッスンを完了する'}<span>→</span></button></section></article><aside className="lesson-aside"><div className="aside-card"><span className="aside-eyebrow">困ったときは</span><h3>ヒントを見てみよう</h3><p>答えを急がず、まずは自分で少し試してみよう。</p>{lesson.tips.slice(0,hint).map((tip) => <div className="hint-text" key={tip}>✳ {tip}</div>)}<button className="hint-button" onClick={() => setHint(Math.min(hint + 1, lesson.tips.length))}>{hint >= lesson.tips.length ? 'ヒントを見ました ✓' : `ヒントをひらく（${hint + 1}/${lesson.tips.length}）`}</button></div><div className="aside-progress"><span>このレッスンの流れ</span><p>01　ヒントを知る</p><p>02　手を動かす</p><p>03　自分の作品へ</p><p>04　ふりかえる</p></div></aside></div></div>;
}

function Projects({ onNew }: { onNew: () => void }) { return <div className="page-content simple-page"><span className="eyebrow">YOUR CREATIVE SPACE</span><h1>マイ作品</h1><p className="library-intro">描いた絵は、この端末に保存されます。</p><div className="empty-state"><div className="empty-art">✎</div><h2>ここから一枚、描いてみよう。</h2><p>キャンバスをひらいて、自由に描いてみましょう。</p><button className="primary-button" onClick={onNew}>キャンバスをひらく <span>→</span></button></div></div>; }
function Review({ completed, open }: { completed: string[]; open: () => void }) { return <div className="page-content simple-page"><span className="eyebrow">LOOK BACK, MOVE FORWARD</span><h1>ふりかえり</h1><p className="library-intro">できたことに目を向けて、次の一歩を見つけよう。</p><div className="review-summary"><span className="review-big">{completed.length}</span><div><b>レッスンを完了しました</b><p>あなたのペースで、ひとつずつ進めています。</p></div></div><h2 className="review-heading">最近のレッスン</h2>{completed.length ? completed.map((id) => {const item = lessons.find((lesson) => lesson.id === id)!; return <div className="review-item" key={id}><span>✓</span><div><b>{item.title}</b><small>{item.category}　·　完了</small></div></div>;}) : <div className="empty-state compact"><div className="empty-art">✳</div><h2>描いたあとに、また会いましょう。</h2><p>レッスンを完了すると、ここに記録されます。</p><button className="text-link" onClick={open}>レッスンを見てみる →</button></div>}</div>; }
function Settings() { return <div className="page-content simple-page"><span className="eyebrow">YOUR SPACE</span><h1>設定</h1><p className="library-intro">自分に合った学び方に整えましょう。</p><div className="settings-card"><div><b>ヒントの表示</b><p>困ったときに、段階的なヒントを表示します。</p></div><select defaultValue="on" aria-label="ヒントの表示"><option value="off">OFF</option><option value="on">ON</option><option value="step">ON・段階表示</option></select></div><div className="settings-card"><div><b>保存先</b><p>作品や進捗はこのブラウザ内に保存されます。</p></div><span className="local-pill"><i /> この端末のみ</span></div><div className="settings-note">✳　毎日少しずつ、自分のリズムで進めていきましょう。</div></div>; }
