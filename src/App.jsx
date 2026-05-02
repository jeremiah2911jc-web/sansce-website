import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  Building2,
  Clock3,
  Mail,
  MapPinned,
  Phone,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { EvaluationSystem } from "./EvaluationSystem.jsx";

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

export default function App() {
  const year = new Date().getFullYear();
  const [isSystemRoute, setIsSystemRoute] = useState(() => window.location.hash.startsWith("#system"));

  useEffect(() => {
    const handleRoute = () => setIsSystemRoute(window.location.hash.startsWith("#system"));

    window.addEventListener("hashchange", handleRoute);
    return () => window.removeEventListener("hashchange", handleRoute);
  }, []);

  if (isSystemRoute) {
    return <EvaluationSystem />;
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
                <a className="system-card__button system-card__button--primary" href="#system">
                  <span>進入系統</span>
                  <ArrowUpRight aria-hidden="true" size={17} />
                </a>
                <a className="system-card__button system-card__button--secondary" href="#system-modules">
                  <span>了解系統</span>
                </a>
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
    </div>
  );
}
