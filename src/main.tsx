import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { CONTACT_EMAIL } from './config';
import './style.css';

const solutions = [
  { title: 'Автоматизация', desc: 'Оптимизация процессов и снижение затрат.', detail: 'Освобождаем команду от повторяющихся операций: обработки заявок, переноса данных и подготовки документов.' },
  { title: 'ИИ-ассистенты', desc: 'Персональные помощники для бизнеса.', detail: 'Помогаем находить ответы в базе знаний, разбирать обращения и готовить материалы под контролем сотрудника.' },
  { title: 'Интеграции', desc: 'Соединяем ваши инструменты в единую систему.', detail: 'Связываем CRM, почту, документы и рабочие сервисы, чтобы информация двигалась между ними без ручного переноса.' },
];
const manual = ['Получение заявки', 'Проверка информации сотрудником', 'Перенос данных', 'Подготовка результата'];
const automatic = ['Получение заявки', 'Автоматическое извлечение данных', 'Проверка по заданным правилам', 'Передача результата сотруднику'];
function Arrow({ circle = false }: { circle?: boolean }) { return <span aria-hidden="true" className={circle ? 'arrow circle' : 'arrow'}>↗</span>; }
function Background() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [failed, setFailed] = useState(false);
  useEffect(() => { const query = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(query.matches); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  return <div className="background" aria-hidden="true"><img src="/media/nexora-poster.jpg" alt="" fetchPriority="high" />{!reduced && !failed && <video autoPlay muted playsInline loop preload="metadata" poster="/media/nexora-poster.jpg" onError={() => setFailed(true)} onCanPlay={event => { void event.currentTarget.play().catch(() => setFailed(true)); }}><source src="/media/nexora-animation.mp4" type="video/mp4" /></video>}</div>;
}
function Demo() {
  const [elapsed, setElapsed] = useState(-1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const start = () => {
    if (timer.current) clearInterval(timer.current);
    setElapsed(0); const beginning = performance.now();
    timer.current = setInterval(() => { const time = performance.now() - beginning; setElapsed(Math.min(time, 8000)); if (time >= 8000 && timer.current) { clearInterval(timer.current); timer.current = null; } }, 80);
  };
  const running = elapsed >= 0 && elapsed < 8000;
  const renderLane = (auto: boolean) => {
    const progress = elapsed < 0 ? 0 : Math.min(1, elapsed / (auto ? 3200 : 8000));
    const stage = elapsed < 0 ? -1 : Math.min(3, Math.floor(progress * 4));
    const steps = auto ? automatic : manual;
    return <div className={`lane ${auto ? 'automated' : ''}`}><h3>{auto ? 'Автоматизация' : 'Ручная обработка'}</h3><div className="chips">{['Заявка', 'Анализ', 'Результат'].map((name, i) => <div key={name} className={`chip ${stage >= (i === 2 ? 3 : i) ? 'active' : ''}`}>{name}</div>)}</div><div className="track" role="progressbar" aria-label={auto ? 'Автоматизированный процесс' : 'Ручной процесс'} aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress * 100}%` }}/>{[0, 1, 2, 3].map(i => <i key={i} className={stage >= i ? 'active' : ''} style={{ left: `${i * 33.333}%` }} />)}</div><p className="stage">{elapsed < 0 ? (auto ? 'По заданным правилам' : 'С участием сотрудника') : progress === 1 ? 'Результат готов' : steps[stage]}</p></div>;
  };
  return <div className="demo-panel" id="interactive-demo"><div className="demo-intro"><h2>Меньше рутины.<br />Больше дела.</h2><p>Один процесс — два подхода.<br />Посмотрите разницу.</p><button className="play-button" onClick={start}><span className="play" aria-hidden="true">{running ? '↻' : '▶'}</span><span>{elapsed < 0 ? 'Посмотреть сценарий' : running ? 'Начать заново' : 'Повторить сценарий'}</span><Arrow /></button></div><div className="comparison">{renderLane(false)}<span className="comparison-arrow" aria-hidden="true">⟶</span>{renderLane(true)}</div><span className="sr-only" role="status">{elapsed >= 8000 ? 'Демонстрация завершена. Оба процесса обработали заявку.' : elapsed >= 3200 ? 'Автоматизированный процесс завершён. Ручной процесс продолжается.' : running ? 'Демонстрация запущена.' : ''}</span></div>;
}
function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim(), email = String(data.get('email') || '').trim(), message = String(data.get('message') || '').trim();
    const next: Record<string, string> = {};
    if (!name) next.name = 'Укажите имя.';
    if (!email) next.email = 'Укажите рабочую почту.'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Проверьте формат: имя@компания.ru';
    if (!message) next.message = 'Кратко опишите задачу.';
    setErrors(next); setStatus('');
    if (Object.keys(next).length) { event.currentTarget.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${Object.keys(next)[0]}"]`)?.focus(); return; }
    if (!CONTACT_EMAIL) { setStatus('Отправка пока недоступна: адрес студии ещё не настроен. Ваше обращение не отправлено, введённые данные сохранены в форме.'); return; }
    setStatus('Обращение подготовлено. Откройте его в почтовом приложении и отправьте письмо самостоятельно.');
  }
  const mailLink = (form: HTMLFormElement | null) => { if (!form) return '#'; const d = new FormData(form); return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Обсудить проект с NEXORA')}&body=${encodeURIComponent(`Имя: ${d.get('name')}\nРабочая почта: ${d.get('email')}\n\n${d.get('message')}`)}`; };
  const formRef = useRef<HTMLFormElement>(null);
  return <form ref={formRef} noValidate onSubmit={submit} onChange={() => { if (status) setStatus(''); }}><div className="form-row">{[{ name: 'name', label: 'Имя', placeholder: 'Как к вам обращаться?', type: 'text' }, { name: 'email', label: 'Рабочая почта', placeholder: 'имя@компания.ru', type: 'email' }].map(f => <label key={f.name} htmlFor={f.name}>{f.label}<input id={f.name} name={f.name} type={f.type} required autoComplete={f.name === 'name' ? 'name' : 'email'} placeholder={f.placeholder} aria-invalid={!!errors[f.name]} aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}/>{errors[f.name] && <span className="error" id={`${f.name}-error`}>{errors[f.name]}</span>}</label>)}</div><label htmlFor="message">Описание задачи<textarea id="message" name="message" rows={3} required placeholder="Что хотите упростить?" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined}/>{errors.message && <span id="message-error" className="error">{errors.message}</span>}</label><div className="form-bottom"><p>Подготовим письмо в вашем почтовом приложении.</p><button className="button dark" type="submit">Подготовить обращение <Arrow /></button></div>{status && <p className="form-status" role="status">{status}</p>}{status && CONTACT_EMAIL && <a className="button" href={mailLink(formRef.current)}>Открыть почтовое приложение <Arrow /></a>}</form>;
}
function App() {
  return <><a className="skip-link" href="#main">К содержанию</a><section className="hero" aria-label="NEXORA — интеллектуальная автоматизация"><Background/><header className="header"><a className="brand" href="#" aria-label="NEXORA — на главную">NEXORA<sup>®</sup></a><nav aria-label="Основная навигация"><a href="#solutions">Решения</a><a href="#approach">Подход</a><a href="#demonstration">Демонстрация</a><a href="#about">О нас</a></nav><a className="button contact-top" href="#contact">Связаться <Arrow circle/></a></header><main id="main" className="hero-layout"><div className="hero-copy"><p className="eyebrow">Интеллектуальная<br/>автоматизация</p><h1>Сложное.<br/>Проще.</h1><p className="lead">Соединяем системы, автоматизируем процессы и внедряем ИИ там, где он действительно полезен.</p><a className="button" href="#solutions">Наши решения <Arrow circle/></a></div><div className="service-list">{solutions.map((s, i) => <a href={`#solution-${i + 1}`} key={s.title}><span className="number">0{i + 1}</span><div><h2>{s.title}</h2><p>{s.desc}</p></div><Arrow/></a>)}</div><div className="hero-bottom"><Demo/><aside className="task"><span className="task-number">04</span><h2>Есть задача?</h2><p>Найдём, что можно упростить в вашем бизнесе.</p><a href="#contact" className="button dark">Обсудить проект <Arrow/></a></aside></div></main></section><div className="sections"><section id="solutions" className="content-section"><div className="section-heading"><span className="kicker">01 / Решения</span><h2>Системы связаны.<br/>Команда свободнее.</h2></div><div className="solution-grid">{solutions.map((s, i) => <article id={`solution-${i + 1}`} key={s.title}><span className="solution-number">0{i + 1}<Arrow/></span><h3>{i === 0 ? 'Автоматизация процессов' : s.title}</h3><p>{s.detail}</p><a className="text-link" href="#contact">Обсудить задачу <Arrow/></a></article>)}</div></section><section id="approach" className="content-section approach"><div className="section-heading"><span className="kicker">02 / Подход</span><h2>От вашего процесса —<br/>к работающему решению.</h2></div><ol className="approach-steps">{[{ title: 'Изучаем процессы', text: 'Разбираемся, как работает команда, где повторяются действия и что действительно стоит автоматизировать.' }, { title: 'Проектируем решение', text: 'Определяем логику, связываем инструменты и согласуем, в каких точках нужен контроль человека.' }, { title: 'Внедряем и улучшаем', text: 'Запускаем решение в рабочей среде, проверяем сценарии и дорабатываем их вместе с командой.' }].map((s, i) => <li key={s.title}><span>0{i + 1}</span><h3>{s.title}</h3><p>{s.text}</p></li>)}</ol></section><section id="demonstration" className="content-section demo-description"><span className="kicker">03 / Демонстрация</span><div><h2>Одна заявка.<br/>Два пути к результату.</h2><p>В ручном процессе сотрудник проверяет информацию, переносит данные и готовит результат. В автоматизированном — система извлекает данные, проверяет их по правилам и передаёт результат сотруднику.</p><p className="note">Это условная визуализация последовательности действий. Скорость анимации не отражает реальные сроки обработки.</p><a className="button" href="#interactive-demo">Попробовать сценарий <Arrow circle/></a></div></section><section id="about" className="content-section about"><span className="kicker">04 / О нас</span><div><h2>Технологии с понятной задачей.</h2><p>NEXORA — студия интеллектуальной автоматизации. Мы создаём решения, которые помогают компаниям сокращать ручные операции и эффективнее использовать существующие инструменты.</p></div></section><section id="contact" className="content-section contact"><div><span className="kicker">05 / Контакты</span><h2>С чего начнём?</h2><p>Расскажите о задаче.<br/>Разберёмся, что можно упростить.</p></div><ContactForm/></section><footer><a className="brand" href="#">NEXORA<sup>®</sup></a><span>Сложное. Проще.</span><a href="#">Наверх ↑</a></footer></div></>;
}

createRoot(document.getElementById('root')!).render(<App/>);
