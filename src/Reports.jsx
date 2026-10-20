import {photoProps,photoSourceProps} from './photo-refresh.js';
import { useEffect, useState, useRef } from 'react';
import { trackReportReading } from './report-reading.js';
import './reports.css';
import CaseReport from './CaseReport.jsx';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
export default function Reports() {
  const [report, setReport] = useState(null),[message, setMessage] = useState(''),[busy, setBusy] = useState(false),[expires, setExpires] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const readEvent = useRef(null);
  useEffect(() => {if (!report) {readEvent.current = null;return;}readEvent.current ??= crypto.randomUUID();return trackReportReading(readEvent.current);}, [report?.id]);
  async function load() {const r = await fetch('/api/reports', { cache: 'no-store', credentials: 'same-origin' });if (!r.ok) {setReport(null);return false;}const d = await r.json();setReport(d.report);setExpires(d.expiresAt);return true;}
  useEffect(() => {load().catch(() => setMessage('連線未完成，請稍後再試。'));}, []);
  useEffect(() => {if (!report) return;function expire() {setReport(null);setMessage('閱讀時間已到，請重新登入。');}const timer = setTimeout(expire, Math.max(0, expires - Date.now()));function check() {if (Date.now() >= expires) expire();}window.addEventListener('pageshow', check);document.addEventListener('visibilitychange', check);return () => {clearTimeout(timer);window.removeEventListener('pageshow', check);document.removeEventListener('visibilitychange', check);};}, [report, expires]);
  async function login(e) {e.preventDefault();setBusy(true);setMessage('');const form = e.currentTarget,data = new FormData(form);try {const r = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportId: data.get('reportId'), password: data.get('password') }) });const d = await r.json();if (!r.ok) {setMessage(d.error);return;}form.reset();if (!(await load())) setMessage('登入未完成，請重試。');} catch {setMessage('連線未完成，請稍後再試。');} finally {setBusy(false);}}
  async function logout() {setBusy(true);try {const r = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });if (!r.ok) throw Error();setReport(null);setMessage('已登出。');} catch {setMessage('登出未完成，請重試。');} finally {setBusy(false);}}

  if (!report) return <div className="reports-entry">
  <div className="reports-entry-top"><a href="/">首頁</a><span aria-hidden="true">／</span><span>案件報告</span><span className="reports-entry-index">SANZE · CLIENT ACCESS</span></div>
  <div className="reports-login">
   <section className="reports-intro" aria-labelledby="reports-entry-title">

    <div className="reports-intro-copy"><p className="reports-kicker"><span /> 三策專案管理顧問</p><h1 id="reports-entry-title">案件報告<span>委託案件專區</span></h1><div className="reports-brand-rule" /><p className="reports-brand-motto"><span>以信實立本，</span><span>以專業成事。</span></p></div>
    <figure className="reports-entry-photo"><img {...photoProps({ src: "/images/redesign/document-review.jpg", alt: "桌面上的基地圖說與案件資料" })} /></figure>
    <div className="reports-intro-bottom"><span>SANZE</span><span>都市更新・個案顧問・案件評估</span></div>
   </section>
   <section className="reports-access" aria-labelledby="reports-access-title">
    <div className="reports-access-heading"><span className="reports-lock"><LockKeyhole size={20} strokeWidth={1.4} aria-hidden="true" /></span><span>授權閱讀</span></div>
    <form className="reports-form" onSubmit={login}>
     <h2 id="reports-access-title">登入案件報告</h2><p className="reports-form-intro">請輸入三策提供的案件編號與閱讀密碼。</p>
     <label htmlFor="report-id">案件編號</label><input id="report-id" name="reportId" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength="80" placeholder="請輸入案件編號" />
     <label htmlFor="report-password">閱讀密碼</label><div className="reports-password"><input id="report-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength="256" placeholder="請輸入閱讀密碼" /><button className="reports-password-toggle" type="button" aria-label={showPassword ? '隱藏密碼' : '顯示密碼'} aria-pressed={showPassword} onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}</button></div>
     <button className="reports-submit" type="submit" disabled={busy}><span>{busy ? '登入中…' : '登入閱讀報告'}</span></button>
     <p className="reports-message" role="status">{message}</p>
    </form>
    <div className="reports-access-foot"><p>報告僅供本案獲授權對象閱讀。</p><a href="/contact">閱讀權限洽詢</a></div>
   </section>
  </div>
 </div>;
  return <CaseReport report={report} onLogout={logout} busy={busy} message={message} />;
}
