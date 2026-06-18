import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  Building2,
  Clock3,
  Download,
  Laptop,
  Mail,
  MapPinned,
  MonitorDown,
  Phone,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { EvaluationSystem } from "./EvaluationSystem.jsx";
import "./download.css";

const services = [
  {
    image: "/images/service-feasibility-analysis.png",
    imageAlt: "前期評估與可行性分析插圖",
    title: "前期評估與可行性分析",
    body: "有土地，不代表馬上就能更新。三策協助地主盤點基地條件、土地現況、建物狀態、法規限制與可能的更新模式，先判斷這個案子有沒有機會、適合怎麼走。",
  },
  {
    image: "/images/service-resident-communication.png",
    imageAlt: "住戶整合與溝通協調插圖",
    title: "住戶整合與溝通協調",
    body: "住戶想法不同，案子就容易停在原地。三策協助整理地主與住戶的需求、疑慮與期待，建立清楚的討論基礎，讓大家能用同一份資訊談條件、談方向、談下一步。",
  },
  {
    image: "/images/service-process-support.png",
    imageAlt: "程序推進與行政協助插圖",
    title: "程序推進與行政協助",
    body: "自主更新需要地主主導，也需要有人掌握流程。三策協助社區了解都市更新、危老重建與自主更新的程序、文件、會議與時程，讓推動過程更清楚，減少盲目摸索。",
  },
  {
    image: "/images/service-resource-integration.png",
    imageAlt: "專業資源整合插圖",
    title: "專業資源整合",
    body: "更新牽涉的不只是一張圖或一個分配表。三策協助整合建築、估價、法律、財務、營建與專案管理等專業資源，讓地主在判斷條件與做出決定前，有更完整的依據。",
  },
];

const desktopDownloads = [
  {
    title: "macOS 測試版",
    manifestPlatform: "macos",
    platform: "macOS",
    subtitle: "適用 Apple Silicon Mac",
    fileName: "Sanze-App-macOS-Test-0.1.0-arm64.zip",
    system: "建議 macOS 13 以上",
    icon: Laptop,
    available: true,
  },
  {
    title: "Windows 測試版",
    manifestPlatform: "windows",
    platform: "Windows",
    subtitle: "適用 Windows 10 / 11 64-bit 電腦",
    fileName: "Sanze-App-Windows-Test-0.1.0-x64-setup.exe",
    system: "建議 Windows 10 / 11 64-bit",
    icon: MonitorDown,
    available: true,
  },
];

function ButtonLink({ href, children, variant = "primary" }) {
  return (
    <a className={`button-link button-link--${variant}`} href={href}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
    </a>
  );
}

function LogoMark() {
  return (
    <div className="brand">
      <img className="brand__logo" src="/logo-sanze.png" alt="Sanze 三策品牌標誌" />
      <div>
        <p className="brand__name">三策專案管理顧問有限公司</p>
        <p className="brand__en">Sanze Project Management Consulting</p>
      </div>
    </div>
  );
}

function DownloadCard({ item, onDownloadRequest }) {
  const Icon = item.icon;

  return (
    <article className="download-card">
      <div className="download-card__icon" aria-hidden="true">
        <Icon size={26} strokeWidth={2.2} />
      </div>
      <div className="download-card__body">
        <p className="download-card__platform">{item.platform}</p>
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
        <dl>
          <div>
            <dt>系統需求</dt>
            <dd>{item.system}</dd>
          </div>
          <div>
            <dt>安裝檔名稱</dt>
            <dd>{item.fileName}</dd>
          </div>
        </dl>
      </div>
      {item.available ? (
        <button className="download-card__button" type="button" onClick={() => onDownloadRequest(item)}>
          <span>下載安裝檔</span>
          <Download aria-hidden="true" size={18} />
        </button>
      ) : (
        <span className="download-card__button download-card__button--pending" aria-disabled="true">
          <span>準備上線</span>
          <Download aria-hidden="true" size={18} />
        </span>
      )}
    </article>
  );
}

function DownloadAuthModal({ error, item, onClose, onPasswordChange, onSubmit, password, status }) {
  if (!item) {
    return null;
  }

  const isSubmitting = status === "submitting";

  return (
    <div className="download-auth" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form
        className="download-auth__panel"
        aria-labelledby="download-auth-title"
        aria-describedby="download-auth-desc"
        onSubmit={onSubmit}
      >
        <button className="download-auth__close" type="button" aria-label="關閉下載密碼視窗" onClick={onClose}>
          <X aria-hidden="true" size={18} strokeWidth={2.2} />
        </button>
        <div className="download-auth__header">
          <p className="section-kicker">DOWNLOAD ACCESS</p>
          <h2 id="download-auth-title">下載 {item.title}</h2>
          <p id="download-auth-desc">請輸入管理者提供的下載密碼。</p>
        </div>
        <label className="download-auth__field">
          <span>下載密碼</span>
          <input
            autoComplete="current-password"
            autoFocus
            name="downloadPassword"
            onChange={(event) => onPasswordChange(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        {error ? <p className="download-auth__error">{error}</p> : null}
        <div className="download-auth__actions">
          <button className="download-auth__secondary" type="button" onClick={onClose}>
            取消
          </button>
          <button className="download-auth__primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "驗證中" : "確認下載"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DownloadStandalonePage({ items, onDownloadRequest }) {
  return (
    <div className="download-page">
      <header className="download-page__header">
        <LogoMark />
        <a className="download-page__back" href="/">
          回到三策官網
        </a>
      </header>

      <main className="download-page__main">
        <section className="download-page__intro" aria-labelledby="download-page-title">
          <p className="section-kicker">DESKTOP APP</p>
          <h1 id="download-page-title">三策 App 測試版下載</h1>
          <p>
            下載三策 App 桌面測試版。此版本供內部測試使用。下載新版後，請先關閉三策 App，再安裝或覆蓋新版；既有資料不會因更新而被覆蓋。
          </p>
        </section>

        <section className="download-page__grid" aria-label="桌面版下載">
          {items.map((item) => (
            <DownloadCard item={item} key={item.platform} onDownloadRequest={onDownloadRequest} />
          ))}
        </section>

        <section className="download-page__notes" aria-labelledby="download-note-title">
          <h2 id="download-note-title">安裝提醒</h2>
          <ul>
            <li>Windows 版若出現安全提醒，請確認來源為三策官方下載頁後再繼續。</li>
            <li>macOS 版目前為測試版，若系統提示無法開啟，請依測試說明由管理者協助開啟。</li>
            <li>目前測試版未啟用自動更新，請由本頁下載新版。</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const year = new Date().getFullYear();
  const [routeHash, setRouteHash] = useState(() => window.location.hash);
  const [releaseInfo, setReleaseInfo] = useState(null);
  const [isDownloadPanelOpen, setIsDownloadPanelOpen] = useState(() => window.location.hash === "#app-download");
  const [downloadGateItem, setDownloadGateItem] = useState(null);
  const [downloadGatePassword, setDownloadGatePassword] = useState("");
  const [downloadGateError, setDownloadGateError] = useState("");
  const [downloadGateStatus, setDownloadGateStatus] = useState("idle");
  const closeDownloadButtonRef = useRef(null);
  const isSystemRoute = routeHash.startsWith("#system");
  const isDownloadsRoute = window.location.pathname.replace(/\/+$/, "") === "/downloads";

  useEffect(() => {
    const handleRoute = () => {
      const nextHash = window.location.hash;

      setRouteHash(nextHash);
      setIsDownloadPanelOpen(nextHash === "#app-download");
    };

    window.addEventListener("hashchange", handleRoute);
    window.addEventListener("popstate", handleRoute);
    return () => {
      window.removeEventListener("hashchange", handleRoute);
      window.removeEventListener("popstate", handleRoute);
    };
  }, []);

  useEffect(() => {
    if (isSystemRoute) {
      return undefined;
    }

    let isMounted = true;

    fetch("/downloads/sanze-app-release.json")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setReleaseInfo(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isSystemRoute]);

  function openDownloadPanel() {
    setIsDownloadPanelOpen(true);

    if (window.location.hash !== "#app-download") {
      window.location.hash = "app-download";
    }
  }

  function closeDownloadPanel() {
    setIsDownloadPanelOpen(false);

    if (window.location.hash === "#app-download") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      setRouteHash(window.location.hash);
    }
  }

  useEffect(() => {
    if (!isDownloadPanelOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeDownloadButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDownloadPanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDownloadPanelOpen]);

  function handleDownloadBackdropMouseDown(event) {
    if (event.target === event.currentTarget) {
      closeDownloadPanel();
    }
  }

  function openDownloadGate(item) {
    setDownloadGateItem(item);
    setDownloadGatePassword("");
    setDownloadGateError("");
    setDownloadGateStatus("idle");
  }

  function closeDownloadGate() {
    if (downloadGateStatus === "submitting") {
      return;
    }

    setDownloadGateItem(null);
    setDownloadGatePassword("");
    setDownloadGateError("");
    setDownloadGateStatus("idle");
  }

  useEffect(() => {
    if (!downloadGateItem) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDownloadGate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [downloadGateItem, downloadGateStatus]);

  async function handleDownloadGateSubmit(event) {
    event.preventDefault();

    if (!downloadGateItem || downloadGateStatus === "submitting") {
      return;
    }

    setDownloadGateStatus("submitting");
    setDownloadGateError("");

    try {
      const response = await fetch("/api/desktop-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: downloadGatePassword,
          platform: downloadGateItem.manifestPlatform,
        }),
      });
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        setDownloadGateError("密碼錯誤，請確認後再試。");
        setDownloadGateStatus("idle");
        return;
      }

      if (!response.ok || !data?.downloadUrl) {
        setDownloadGateError("目前無法提供下載，請稍後再試。");
        setDownloadGateStatus("idle");
        return;
      }

      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.fileName || downloadGateItem.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadGateItem(null);
      setDownloadGatePassword("");
      setDownloadGateStatus("idle");
    } catch {
      setDownloadGateError("目前無法提供下載，請稍後再試。");
      setDownloadGateStatus("idle");
    }
  }

  if (isSystemRoute) {
    return <EvaluationSystem routeHash={routeHash} />;
  }

  const downloadItems = desktopDownloads.map((item) => {
    const releaseItem = releaseInfo?.downloads?.find((download) => download.platform === item.manifestPlatform);

    return {
      ...item,
      available: releaseInfo ? Boolean(releaseItem?.available) : item.available,
      fileName: releaseItem?.fileName ?? item.fileName,
    };
  });

  if (isDownloadsRoute) {
    return (
      <>
        <DownloadStandalonePage items={downloadItems} onDownloadRequest={openDownloadGate} />
        <DownloadAuthModal
          error={downloadGateError}
          item={downloadGateItem}
          onClose={closeDownloadGate}
          onPasswordChange={setDownloadGatePassword}
          onSubmit={handleDownloadGateSubmit}
          password={downloadGatePassword}
          status={downloadGateStatus}
        />
      </>
    );
  }

  return (
    <div className="site-shell">
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <header className="site-header">
            <LogoMark />
          </header>

          <div className="hero__content">
            <h1 id="hero-title">
              讓地主從被動等條件
              <span>走向主動掌握更新方向</span>
            </h1>
            <div className="hero__text">
              <p className="hero__questions">
                有土地，卻不知道能怎麼做。
                <br />
                想更新，卻不知道條件合不合理。
                <br />
                建商提出分配，卻看不懂該怎麼判斷。
                <br />
                住戶意見不一致，案子遲遲推不動。
                <br />
                政府推動自主更新，卻不知道第一步該從哪裡開始。
              </p>
              <div className="hero__rule" aria-hidden="true" />
              <p className="hero__summary">
                三策協助地主從基地條件、分配邏輯、住戶共識與推動流程開始釐清，讓社區在都市更新、危老重建與自主更新的路上，能夠看懂條件、整合意見、掌握主導權。
              </p>
            </div>
          </div>

          <div className="hero__visual">
            <img src="/images/hero-community-renewal.jpg" alt="都市更新社區建築主視覺" />
          </div>
        </section>

        <section className="services section-pad" id="services" aria-labelledby="services-title">
          <div className="services__intro">
            <p className="section-kicker">SERVICES</p>
            <h2 id="services-title">
              自主更新
              <span>地主可以自己主導</span>
              <span>但不用自己摸索</span>
            </h2>
            <p>
              過去地主想推動都市更新，常常只能等待建商提出條件，再進入合建協商。但實務上，許多案子在初期就卡住，原因往往是分配條件談不攏、住戶期待落差太大、資訊不透明、法規與財務評估不清楚。
              <br />
              <br />
              三策站在地主端，協助社區先把條件看清楚，把問題拆開來處理，把共識慢慢建立起來。當地主理解自己的基地價值、更新選項與推動路徑，就能更有底氣地面對討論，也更有機會把案子往前推進。
            </p>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.title}>
                <div className="service-card__media">
                  <img src={service.image} alt={service.imageAlt} />
                </div>
                <div className="service-card__body">
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contact section-pad" id="contact" aria-labelledby="contact-title">
          <div className="contact-feature">
            <div className="contact__photo">
              <img src="/images/contact-consulting-space.jpg" alt="明亮的顧問洽談空間" />
            </div>

            <div className="contact__cta">
              <p className="section-kicker section-kicker--light">CONTACT</p>
              <h2 id="contact-title">先看懂條件，再決定怎麼走</h2>
              <p>
                若您的土地或社區正在思考都市更新、危老重建或自主更新，三策可以協助您先釐清目前卡在哪裡：是基地條件、分配問題、住戶共識、法規限制，還是推動流程不清楚。
                <br />
                <br />
                先把問題看清楚，才知道下一步該怎麼走。歡迎與三策聯繫，讓我們陪您從現況開始評估。
              </p>
              <ButtonLink href="mailto:sanze.consulting@gmail.com" variant="light">
                預約初步諮詢
              </ButtonLink>
            </div>
          </div>

          <div className="contact-side">
            <aside className="contact-info" aria-label="聯絡資訊">
              <div className="contact-info__item contact-info__item--company">
                <Building2 aria-hidden="true" size={22} />
                <div>
                  <p>三策專案管理顧問有限公司</p>
                  <p className="contact-company-en">Sanze Project Management Consulting Co., Ltd.</p>
                </div>
              </div>
              <div className="contact-info__columns">
                <div className="contact-info__item">
                  <Phone aria-hidden="true" size={21} />
                  <div>
                    <h3>服務電話</h3>
                    <p>
                      <a href="tel:0916711323">0916-711-323</a>
                    </p>
                  </div>
                </div>
                <div className="contact-info__item">
                  <Mail aria-hidden="true" size={21} />
                  <div>
                    <h3>電子郵件</h3>
                    <p>
                      <a href="mailto:sanze.consulting@gmail.com">sanze.consulting@gmail.com</a>
                    </p>
                  </div>
                </div>
                <div className="contact-info__item">
                  <Clock3 aria-hidden="true" size={21} />
                  <div>
                    <h3>服務時間</h3>
                    <p className="service-hours">
                      <span>週一至週五</span>
                      <span>09:00 - 18:00</span>
                    </p>
                  </div>
                </div>
                <div className="contact-info__item">
                  <MapPinned aria-hidden="true" size={21} />
                  <div>
                    <h3>官方 LINE</h3>
                    <p>LINE ID：@160rlvqj</p>
                  </div>
                </div>
              </div>
              <div className="line-block">
                <div className="line-block__qr" aria-label="三策官方 LINE QR code">
                  <QRCodeSVG value="https://line.me/R/ti/p/@160rlvqj" size={126} bgColor="#ffffff" fgColor="#111111" includeMargin />
                </div>
                <a className="line-block__link" href="https://line.me/R/ti/p/@160rlvqj" target="_blank" rel="noreferrer">
                  加入 LINE 官方帳號
                </a>
              </div>
            </aside>

            <article className="system-card" aria-labelledby="system-card-title">
              <div className="system-card__topline">
                <span>PRO SYSTEM</span>
                <BarChart3 aria-hidden="true" size={21} strokeWidth={2.2} />
              </div>
              <h3 id="system-card-title">開發評估系統</h3>
              <p>
                提供都市更新、危老重建與自主更新案件初步評估工具，協助整理基地條件、比對開發方向、評估可行性，讓前期判斷更有依據。
              </p>
              <div className="system-card__dashboard" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="system-card__actions">
                <a className="system-card__button system-card__button--primary" href="#system-workspace">
                  <span>申請系統授權</span>
                  <ArrowUpRight aria-hidden="true" size={17} />
                </a>
                <button className="system-card__button system-card__button--secondary" type="button" onClick={openDownloadPanel}>
                  <span>下載桌面版</span>
                  <Download aria-hidden="true" size={17} />
                </button>
                <span className="system-card__status">正式授權後開通</span>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© {year} 三策專案管理顧問有限公司 版權所有</p>
        <div className="site-footer__links">
          <a href="#top">隱私權政策</a>
          <a href="#top">網站使用條款</a>
        </div>
      </footer>

      {isDownloadPanelOpen ? (
        <div className="download-modal" onMouseDown={handleDownloadBackdropMouseDown}>
          <section
            className="download-modal__panel"
            id="app-download"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-download-title"
          >
            <header className="download-modal__header">
              <div className="download-modal__intro">
                <p className="section-kicker">DESKTOP APP</p>
                <h2 id="app-download-title">三策 App 桌面版</h2>
              </div>
              <button
                className="download-modal__close"
                type="button"
                aria-label="關閉下載面板"
                ref={closeDownloadButtonRef}
                onClick={closeDownloadPanel}
              >
                <X aria-hidden="true" size={20} strokeWidth={2.2} />
              </button>
            </header>

            <div className="download-modal__grid" aria-label="下載項目">
              {downloadItems.map((item) => (
                <DownloadCard item={item} key={item.platform} onDownloadRequest={openDownloadGate} />
              ))}
            </div>
          </section>
        </div>
      ) : null}
      <DownloadAuthModal
        error={downloadGateError}
        item={downloadGateItem}
        onClose={closeDownloadGate}
        onPasswordChange={setDownloadGatePassword}
        onSubmit={handleDownloadGateSubmit}
        password={downloadGatePassword}
        status={downloadGateStatus}
      />
    </div>
  );
}
