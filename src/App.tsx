import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft, ArrowRight, Bell, BookOpen, BookPlus, Check, ChevronDown, ChevronRight,
  Clapperboard, Clock3, Cloud, Command, FileImage, FileText, ImagePlus, Layers3,
  LayoutDashboard, Menu, MessageSquareText, MoreHorizontal, Plus, Search, Settings2,
  Cpu, LoaderCircle, RefreshCw, Sparkles, Upload, WandSparkles, X, Zap, type LucideIcon,
} from 'lucide-react'

type Page = 'Overview' | 'My Stories' | 'Characters' | 'Art Styles' | 'AI Studio' | 'Storyboard' | 'Panel Editor'
type Story = { id: string; title: string; synopsis: string; content: string; createdAt: string }
type Character = { id: string; name: string; role: string; description: string; storyId: string }
type ArtStyle = { id: string; name: string; notes: string; fileName: string; preview?: string }
type Scene = { id: string; title: string; description: string; storyId: string; status: 'Draft' | 'Ready' }
type AIAnalysis = { storyId: string; genre: string; logline: string; synopsis: string; themes: string[]; characters: { name: string; role: string; description: string }[]; scenes: { title: string; summary: string }[] }
type Modal = 'story' | 'character' | 'style' | 'scene' | null

const navItems: { label: Page; icon: LucideIcon; section: string }[] = [
  { label: 'Overview', icon: LayoutDashboard, section: 'STUDIO' },
  { label: 'My Stories', icon: BookOpen, section: 'STUDIO' },
  { label: 'Characters', icon: Layers3, section: 'BUILD YOUR WORLD' },
  { label: 'Art Styles', icon: ImagePlus, section: 'BUILD YOUR WORLD' },
  { label: 'AI Studio', icon: Sparkles, section: 'INTELLIGENCE' },
  { label: 'Storyboard', icon: Clapperboard, section: 'PRODUCTION' },
  { label: 'Panel Editor', icon: FileImage, section: 'PRODUCTION' },
]
const starterTips = [
  { icon: BookOpen, title: 'Add your first story', text: 'Bring in a novel or start with a blank page.', page: 'My Stories' as Page },
  { icon: Layers3, title: 'Build your characters', text: 'Keep names, traits, and appearances consistent.', page: 'Characters' as Page },
  { icon: ImagePlus, title: 'Set your visual direction', text: 'Save the art references you want to follow.', page: 'Art Styles' as Page },
  { icon: Clapperboard, title: 'Shape your first episode', text: 'Turn important moments into storyboard scenes.', page: 'Storyboard' as Page },
]
const makeId = () => Math.random().toString(36).slice(2, 10)
function readStorage<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}

export default function App() {
  const [page, setPage] = useState<Page>('Overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [modal, setModal] = useState<Modal>(null)
  const [stories, setStories] = useState<Story[]>(() => readStorage('manhwa-stories', []))
  const [characters, setCharacters] = useState<Character[]>(() => readStorage('manhwa-characters', []))
  const [styles, setStyles] = useState<ArtStyle[]>(() => readStorage('manhwa-styles', []))
  const [scenes, setScenes] = useState<Scene[]>(() => readStorage('manhwa-scenes', []))
  const [selectedStoryId, setSelectedStoryId] = useState('')
  const [selectedSceneId, setSelectedSceneId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [aiModels, setAiModels] = useState<string[]>([])
  const [selectedAiModel, setSelectedAiModel] = useState('')
  const [aiStatus, setAiStatus] = useState<'idle' | 'checking' | 'connected' | 'offline'>('idle')
  const [aiError, setAiError] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [storyTitle, setStoryTitle] = useState('')
  const [storySynopsis, setStorySynopsis] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [characterRole, setCharacterRole] = useState('Main character')
  const [characterDescription, setCharacterDescription] = useState('')
  const [styleName, setStyleName] = useState('')
  const [styleNotes, setStyleNotes] = useState('')
  const [styleFile, setStyleFile] = useState<File | null>(null)
  const [sceneTitle, setSceneTitle] = useState('')
  const [sceneDescription, setSceneDescription] = useState('')

  useEffect(() => localStorage.setItem('manhwa-stories', JSON.stringify(stories)), [stories])
  useEffect(() => localStorage.setItem('manhwa-characters', JSON.stringify(characters)), [characters])
  useEffect(() => localStorage.setItem('manhwa-styles', JSON.stringify(styles.map(({ preview, ...item }) => item))), [styles])
  useEffect(() => localStorage.setItem('manhwa-scenes', JSON.stringify(scenes)), [scenes])

  const selectedStory = stories.find((story) => story.id === selectedStoryId) ?? stories[0]
  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0]
  const filteredStories = stories.filter((story) => story.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const wordCount = useMemo(() => stories.reduce((sum, story) => sum + (story.content.trim() ? story.content.trim().split(/\s+/).length : 0), 0), [stories])
  const currentTitle = page === 'Overview' ? 'Your creative desk' : page

  function go(next: Page) { setPage(next); setMobileNav(false); setNotice('') }
  function resetModal() {
    setModal(null); setStoryTitle(''); setStorySynopsis(''); setCharacterName(''); setCharacterRole('Main character')
    setCharacterDescription(''); setStyleName(''); setStyleNotes(''); setStyleFile(null); setSceneTitle(''); setSceneDescription('')
  }
  function createStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!storyTitle.trim()) return
    const story = { id: makeId(), title: storyTitle.trim(), synopsis: storySynopsis.trim(), content: '', createdAt: new Date().toISOString() }
    setStories((current) => [story, ...current]); setSelectedStoryId(story.id); setPage('My Stories'); resetModal(); setNotice('Your new story workspace is ready.')
  }
  function importNovel(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!/\.(txt|md)$/i.test(file.name)) { setNotice('For this first version, please upload a .txt or .md novel file.'); event.target.value = ''; return }
    const reader = new FileReader()
    reader.onload = () => {
      const title = file.name.replace(/\.(txt|md)$/i, '').replace(/[_-]/g, ' ')
      const story = { id: makeId(), title: title || 'Untitled story', synopsis: 'Imported from your local device.', content: String(reader.result ?? ''), createdAt: new Date().toISOString() }
      setStories((current) => [story, ...current]); setSelectedStoryId(story.id); setPage('My Stories'); setNotice('Novel imported and saved in this browser.')
    }
    reader.onerror = () => setNotice('Could not read that file. Try another .txt or .md file.')
    reader.readAsText(file); event.target.value = ''
  }
  function createCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!characterName.trim()) return
    setCharacters((current) => [{ id: makeId(), name: characterName.trim(), role: characterRole, description: characterDescription.trim(), storyId: selectedStory?.id ?? '' }, ...current])
    resetModal(); setNotice('Character added to your bible.')
  }
  function createStyle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!styleName.trim()) return
    const save = (preview?: string) => {
      setStyles((current) => [{ id: makeId(), name: styleName.trim(), notes: styleNotes.trim(), fileName: styleFile?.name ?? '', preview }, ...current])
      resetModal(); setNotice('Art direction reference saved.')
    }
    if (styleFile) { const reader = new FileReader(); reader.onload = () => save(String(reader.result ?? '')); reader.readAsDataURL(styleFile) } else save()
  }
  function createScene(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!sceneTitle.trim()) return
    const scene = { id: makeId(), title: sceneTitle.trim(), description: sceneDescription.trim(), storyId: selectedStory?.id ?? '', status: 'Draft' as const }
    setScenes((current) => [scene, ...current]); setSelectedSceneId(scene.id); resetModal(); setPage('Storyboard'); setNotice('Scene added to your storyboard.')
  }
  function splitIntoScenes() {
    if (!selectedStory?.content.trim()) { setNotice('Import a novel with text first, then split its paragraphs into scene drafts.'); return }
    const paragraphs = selectedStory.content.split(/\n\s*\n/).map((part) => part.trim()).filter((part) => part.length > 35).slice(0, 12)
    if (!paragraphs.length) { setNotice('Add a few paragraphs to your novel before creating scene drafts.'); return }
    const generated = paragraphs.map((paragraph, index) => ({
      id: makeId(), title: 'Scene ' + String(index + 1).padStart(2, '0'),
      description: paragraph.length > 240 ? paragraph.slice(0, 237) + '...' : paragraph,
      storyId: selectedStory.id, status: 'Draft' as const,
    }))
    setScenes((current) => [...generated, ...current]); setSelectedSceneId(generated[0].id)
    setNotice(generated.length + ' scene drafts created. This is a local paragraph split, not AI analysis.')
  }

  async function connectLocalAI() {
    setAiStatus('checking')
    setAiError('')
    try {
      const response = await fetch('/ollama/api/tags')
      if (!response.ok) throw new Error('Ollama returned HTTP ' + response.status)
      const data = await response.json() as { models?: { name?: string; model?: string }[] }
      const models = (data.models ?? []).map((item) => item.name ?? item.model ?? '').filter(Boolean)
      setAiModels(models)
      setSelectedAiModel((current) => current && models.includes(current) ? current : models[0] ?? '')
      setAiStatus('connected')
      if (!models.length) setAiError('Ollama is running, but no model is installed yet. Install a small instruct model, then check again.')
    } catch (error) {
      setAiModels([])
      setAiStatus('offline')
      setAiError('Cannot reach Ollama at 127.0.0.1:11434. Open the Ollama app first, then click Check connection again. ' + (error instanceof Error ? error.message : ''))
    }
  }

  async function analyzeWithLocalAI() {
    if (!selectedStory?.content.trim()) { setAiError('Choose a story that contains imported novel text first.'); return }
    if (!selectedAiModel) { setAiError('Connect Ollama and select an installed model first.'); return }
    setAiBusy(true)
    setAiError('')
    try {
      const fullText = selectedStory.content
      const excerpt = fullText.length > 24000
        ? fullText.slice(0, 16000) + '\n\n[Some middle text is omitted to fit the local model context.]\n\n' + fullText.slice(-8000)
        : fullText
      const prompt = 'Novel title: ' + selectedStory.title + '\n\n' +
        'Analyze the following novel text for a manhwa adaptation. The text may be an excerpt if it is marked as omitted. Do not claim to know events outside the provided text.\n\n' +
        'Return ONLY valid JSON with this exact shape: ' +
        '{"genre":"string","logline":"one sentence","synopsis":"short synopsis","themes":["theme"],"characters":[{"name":"character name","role":"story role","description":"appearance, personality, motivation, and evidence from the text"}],"scenes":[{"title":"short scene title","summary":"what happens and the emotional beat"}]}. ' +
        'Use Indonesian. Include up to 10 important characters and up to 10 scenes. Only include details supported by the text. If a detail is uncertain, say so briefly rather than inventing it.\n\n' + excerpt
      const response = await fetch('/ollama/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedAiModel,
          stream: false,
          format: 'json',
          messages: [
            { role: 'system', content: 'Anda adalah editor naskah dan analis cerita untuk adaptasi manhwa. Analisis hanya berdasarkan teks yang diberikan. Jangan mengarang tokoh, hubungan, latar, atau peristiwa. Balas hanya JSON valid sesuai struktur yang diminta.' },
            { role: 'user', content: prompt },
          ],
          options: { temperature: 0.25 },
        }),
      })
      const payload = await response.json() as { message?: { content?: string }; error?: string }
      if (!response.ok) throw new Error(payload.error ?? 'Local model request failed with HTTP ' + response.status)
      const raw = (payload.message?.content ?? '').trim()
      if (!raw) throw new Error('The local model returned an empty response. Try another model or a shorter novel.')
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
      const parsed = JSON.parse(cleaned) as Partial<AIAnalysis>
      const normalized: AIAnalysis = {
        storyId: selectedStory.id,
        genre: typeof parsed.genre === 'string' ? parsed.genre : 'Belum teridentifikasi',
        logline: typeof parsed.logline === 'string' ? parsed.logline : '',
        synopsis: typeof parsed.synopsis === 'string' ? parsed.synopsis : '',
        themes: Array.isArray(parsed.themes) ? parsed.themes.filter((item): item is string => typeof item === 'string').slice(0, 8) : [],
        characters: Array.isArray(parsed.characters) ? parsed.characters.map((item) => ({
          name: typeof item.name === 'string' ? item.name.trim() : '',
          role: typeof item.role === 'string' ? item.role : 'Belum ditentukan',
          description: typeof item.description === 'string' ? item.description : '',
        })).filter((item) => item.name).slice(0, 10) : [],
        scenes: Array.isArray(parsed.scenes) ? parsed.scenes.map((item) => ({
          title: typeof item.title === 'string' ? item.title : 'Adegan tanpa judul',
          summary: typeof item.summary === 'string' ? item.summary : '',
        })).filter((item) => item.title).slice(0, 10) : [],
      }
      setAiAnalysis(normalized)
      if (fullText.length > 24000) setAiError('Catatan: novel cukup panjang, jadi analisis memakai bagian awal dan akhir. Untuk analisis menyeluruh per bab, kita akan menambahkan pemrosesan bertahap.')
    } catch (error) {
      setAiError('Analisis gagal: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setAiBusy(false)
    }
  }

  function saveAnalysisSynopsis() {
    if (!aiAnalysis?.synopsis) return
    setStories((current) => current.map((story) => story.id === aiAnalysis.storyId ? { ...story, synopsis: aiAnalysis.synopsis } : story))
    setNotice('Sinopsis hasil analisis disimpan ke story library.')
  }

  function saveAnalysisCharacters() {
    if (!aiAnalysis) return
    const existing = new Set(characters.filter((character) => character.storyId === aiAnalysis.storyId).map((character) => character.name.toLowerCase()))
    const additions = aiAnalysis.characters.filter((character) => !existing.has(character.name.toLowerCase())).map((character) => ({
      id: makeId(), name: character.name, role: character.role, description: character.description, storyId: aiAnalysis.storyId,
    }))
    if (!additions.length) { setNotice('Tidak ada karakter baru untuk ditambahkan.'); return }
    setCharacters((current) => [...additions, ...current])
    setNotice(additions.length + ' karakter ditambahkan ke Character Bible.')
  }

  function saveAnalysisScenes() {
    if (!aiAnalysis || !aiAnalysis.scenes.length) return
    const additions = aiAnalysis.scenes.map((scene, index) => ({
      id: makeId(), title: scene.title || 'Scene ' + String(index + 1).padStart(2, '0'),
      description: scene.summary, storyId: aiAnalysis.storyId, status: 'Draft' as const,
    }))
    setScenes((current) => [...additions, ...current])
    setSelectedStoryId(aiAnalysis.storyId)
    setSelectedSceneId(additions[0].id)
    setPage('Storyboard')
    setNotice(additions.length + ' adegan ditambahkan ke Storyboard.')
  }

  return <div className="app-shell">
    <aside className={'sidebar ' + (mobileNav ? 'sidebar-open' : '')}>
      <div className="brand-lockup"><div className="brand-mark"><span>M</span><i /></div><div><div className="brand-name">manhwa<span>studio</span></div><div className="brand-caption">YOUR PERSONAL STORY LAB</div></div><button className="icon-button sidebar-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button></div>
      <div className="workspace-switcher"><div className="workspace-avatar">V</div><div className="workspace-copy"><strong>My workspace</strong><span>Personal studio</span></div><ChevronDown size={15} className="muted-icon" /></div>
      <nav className="side-nav">{['STUDIO', 'BUILD YOUR WORLD', 'INTELLIGENCE', 'PRODUCTION'].map((section) => <div className="nav-section" key={section}><div className="nav-label">{section}</div>{navItems.filter((item) => item.section === section).map((item) => { const Icon = item.icon; return <button key={item.label} className={'nav-link ' + (page === item.label ? 'active' : '')} onClick={() => go(item.label)}><Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.label === 'My Stories' && stories.length > 0 && <span className="nav-count">{stories.length}</span>}</button> })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="local-card"><div className="local-card-icon"><Cloud size={16} /></div><div><strong>Local-first workspace</strong><span>Your drafts stay in this browser.</span></div><span className="online-dot" /></div><button className="nav-link settings-link" onClick={() => setNotice('Settings and local AI engine configuration will be added in a later build.')}><Settings2 size={17} /><span>Settings</span></button><div className="profile-row"><div className="profile-avatar">V</div><div className="profile-copy"><strong>Creator</strong><span>Personal account</span></div><MoreHorizontal size={18} className="muted-icon" /></div></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={19} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{currentTitle}</strong></div></div><div className="topbar-actions"><label className="search-box"><Search size={16} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search stories..." /><kbd><Command size={11} /> K</kbd></label><span className="topbar-divider" /><div className="engine-pill"><span className="engine-dot" /> LOCAL MODE</div><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">V</div></div></header>
      <div className="page-content">
        {notice && <div className="notice-bar"><Check size={15} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={15} /></button></div>}

        {page === 'Overview' && <section>
          <div className="page-heading"><div><div className="eyebrow"><Sparkles size={13} /> THE CREATOR'S WORKSPACE</div><h1>Make your story <span>seen.</span></h1><p>Everything you need to shape a novel into a world of panels.</p></div><button className="primary-button" onClick={() => setModal('story')}><Plus size={17} /> New story</button></div>
          <div className="hero-card"><div className="hero-copy"><div className="hero-kicker"><span className="kicker-line" /> YOUR NEXT CHAPTER STARTS HERE</div><h2>From the first word<br />to the <em>final panel.</em></h2><p>A quiet space to build characters, define your art direction, and bring every scene to life — one step at a time.</p><div className="hero-actions"><button className="hero-button" onClick={() => setModal('story')}>Start creating <ArrowRight size={16} /></button><button className="text-button" onClick={() => go('My Stories')}>Explore workspace</button></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-spark spark-a">✳</div><div className="art-spark spark-b">✦</div><div className="hero-sheet sheet-back"><span>CHAPTER 01</span><i /><i /><i /></div><div className="hero-sheet sheet-front"><div className="sheet-top"><span>STORY / 001</span><span>✳</span></div><div className="sheet-illustration"><div className="silhouette-head" /><div className="silhouette-body" /><div className="silhouette-shine" /></div><div className="sheet-lines"><i /><i /><i /></div></div><div className="floating-tag tag-top"><Sparkles size={13} /> STORY TO PANEL</div><div className="floating-tag tag-bottom"><span className="tiny-pink-dot" /> YOUR WORLD, YOUR RULES</div></div><div className="hero-grain" /></div>
          <div className="section-heading"><div><h3>Your studio at a glance</h3><p>A little progress adds up to a whole new world.</p></div><span className="subtle-label">ALL WORKSPACES</span></div>
          <div className="stats-grid"><StatCard icon={BookOpen} label="Stories" value={stories.length.toString().padStart(2, '0')} detail={wordCount.toLocaleString() + ' words in your library'} /><StatCard icon={Layers3} label="Characters" value={characters.length.toString().padStart(2, '0')} detail="In your character bible" /><StatCard icon={ImagePlus} label="Art references" value={styles.length.toString().padStart(2, '0')} detail="Visual direction saved" /><StatCard icon={Clapperboard} label="Scene drafts" value={scenes.length.toString().padStart(2, '0')} detail="Ready to be shaped" /></div>
          <div className="lower-grid"><div className="panel-card"><div className="card-heading"><div><h3>Recent stories</h3><p>Pick up where your imagination left off.</p></div><button className="subtle-action" onClick={() => go('My Stories')}>View all <ArrowRight size={14} /></button></div>{stories.length ? stories.slice(0, 3).map((story) => <StoryRow key={story.id} story={story} onClick={() => { setSelectedStoryId(story.id); go('My Stories') }} />) : <EmptyInline icon={BookOpen} title="Your bookshelf is waiting" text="Import a novel or create a new story to begin." action="Add your first story" onClick={() => setModal('story')} />}</div>
            <div className="panel-card"><div className="card-heading"><div><h3>Build your universe</h3><p>Four small steps to get started.</p></div><span className="step-count">0{[stories.length > 0, characters.length > 0, styles.length > 0, scenes.length > 0].filter(Boolean).length}/04</span></div><div className="starter-list">{starterTips.map((tip, index) => { const Icon = tip.icon; const done = [stories.length > 0, characters.length > 0, styles.length > 0, scenes.length > 0][index]; return <button className="starter-item" key={tip.title} onClick={() => go(tip.page)}><span className={'starter-icon ' + (done ? 'done' : '')}>{done ? <Check size={15} /> : <Icon size={16} />}</span><span className="starter-copy"><strong>{tip.title}</strong><small>{tip.text}</small></span><ChevronRight size={15} className="muted-icon" /></button> })}</div></div></div>
          <div className="dashboard-footnote"><span className="pink-star">✳</span> Made for stories that deserve to be seen. <span>More tools are on the way.</span></div>
        </section>}

        {page === 'My Stories' && <section className="workspace-page">
          <PageIntro eyebrow="YOUR LIBRARY" title="My stories" description="Every great manhwa begins with a story worth telling." action={<button className="primary-button" onClick={() => setModal('story')}><Plus size={17} /> New story</button>} />
          <div className="import-banner"><div className="import-icon"><Upload size={19} /></div><div className="import-copy"><strong>Have a novel ready?</strong><span>Import a plain text or Markdown file. Your draft stays on this device.</span></div><label className="outline-button">Import novel <input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={importNovel} hidden /></label></div>
          {filteredStories.length ? <div className="story-grid">{filteredStories.map((story, index) => <button className="story-card" key={story.id} onClick={() => { setSelectedStoryId(story.id); setNotice('Selected ' + story.title + '.') }}><div className={'story-cover cover-' + (index % 4)}><span className="cover-index">STORY / {String(index + 1).padStart(3, '0')}</span><div className="cover-orbit" /><div className="cover-glyph">✳</div><span className="cover-bottom">MANHWA STUDIO</span></div><div className="story-card-info"><div><h3>{story.title}</h3><p>{story.synopsis || 'No synopsis yet.'}</p></div><MoreHorizontal size={17} className="muted-icon" /></div><div className="story-card-meta"><span><FileText size={13} /> {story.content ? story.content.trim().split(/\s+/).length.toLocaleString() + ' words' : 'Blank story'}</span><span><Clock3 size={13} /> {new Date(story.createdAt).toLocaleDateString()}</span></div></button>)}</div> : <EmptyState icon={BookOpen} title={searchQuery ? 'No stories found' : 'A blank page is full of possibility'} text={searchQuery ? 'Try a different title or clear your search.' : 'Create a story from scratch or import your novel to make this space yours.'} actionLabel={searchQuery ? 'Clear search' : 'Create your first story'} onAction={() => searchQuery ? setSearchQuery('') : setModal('story')} />}
          {selectedStory && <div className="selected-story-panel"><div className="selected-story-top"><div><div className="eyebrow">CURRENTLY SELECTED</div><h3>{selectedStory.title}</h3></div><span className="status-badge"><span /> IN YOUR WORKSPACE</span></div><p>{selectedStory.synopsis || 'Add a synopsis when you are ready. Your original text is stored locally in this browser.'}</p><div className="selected-story-actions"><button className="outline-button" onClick={() => go('Storyboard')}>Open storyboard <ArrowRight size={14} /></button><button className="text-button danger-text" onClick={() => { if (window.confirm('Delete this story and its local draft?')) { setStories((items) => items.filter((item) => item.id !== selectedStory.id)); setScenes((items) => items.filter((item) => item.storyId !== selectedStory.id)); setNotice('Story deleted from this browser.') } }}>Delete story</button></div></div>}
        </section>}

        {page === 'Characters' && <section className="workspace-page"><PageIntro eyebrow="BUILD YOUR WORLD" title="Character bible" description="Keep every face, personality, and backstory consistent across your episodes." action={<button className="primary-button" onClick={() => setModal('character')}><Plus size={17} /> Add character</button>} /><div className="info-strip"><Sparkles size={16} /><span><strong>Consistency starts here.</strong> Record each character's role and defining traits before you start drawing panels.</span></div>{characters.length ? <div className="character-grid">{characters.map((character, index) => <div className="character-card" key={character.id}><div className={'character-avatar avatar-' + (index % 4)}>{character.name.slice(0, 1).toUpperCase()}</div><div className="character-card-body"><span className="character-role">{character.role}</span><h3>{character.name}</h3><p>{character.description || 'No character notes yet.'}</p><div className="character-card-foot"><span>CHARACTER PROFILE</span><button className="icon-button small" onClick={() => setCharacters((items) => items.filter((item) => item.id !== character.id))} aria-label={'Delete ' + character.name}><X size={15} /></button></div></div></div>)}</div> : <EmptyState icon={Layers3} title="Meet the cast" text="Add your protagonist, antagonist, and supporting characters. Their profiles will live here." actionLabel="Create a character" onAction={() => setModal('character')} />}</section>}

        {page === 'Art Styles' && <section className="workspace-page"><PageIntro eyebrow="BUILD YOUR WORLD" title="Art direction" description="Collect visual references and define the look and feeling of your manhwa." action={<button className="primary-button" onClick={() => setModal('style')}><Plus size={17} /> Add reference</button>} /><div className="style-callout"><div className="style-callout-mark"><WandSparkles size={19} /></div><div><strong>Your visual north star.</strong><p>Save reference images, describe linework, coloring, lighting, and mood. Later, the local image pipeline can use these notes as guidance.</p></div><span className="coming-label">LOCAL AI · PLANNED</span></div>{styles.length ? <div className="style-grid">{styles.map((style, index) => <div className="style-card" key={style.id}><div className={'style-preview style-preview-' + (index % 4)}>{style.preview ? <img src={style.preview} alt={style.name} /> : <div className="style-placeholder"><ImagePlus size={27} /><span>VISUAL REFERENCE</span></div>}<span className="style-number">REF 0{index + 1}</span></div><div className="style-card-copy"><div><h3>{style.name}</h3><p>{style.notes || style.fileName || 'No notes added.'}</p></div><button className="icon-button small" onClick={() => setStyles((items) => items.filter((item) => item.id !== style.id))} aria-label={'Delete ' + style.name}><X size={15} /></button></div></div>)}</div> : <EmptyState icon={ImagePlus} title="Find your visual language" text="Add an image reference and notes about the art style you want to explore." actionLabel="Add your first reference" onAction={() => setModal('style')} />}</section>}

        {page === 'Storyboard' && <section className="workspace-page"><PageIntro eyebrow="PRODUCTION WORKSPACE" title="Storyboard" description="Break the story into scenes and plan the emotional rhythm of each episode." action={<button className="primary-button" onClick={() => setModal('scene')}><Plus size={17} /> Add scene</button>} /><div className="storyboard-toolbar"><div className="select-wrap"><BookOpen size={15} /><select value={selectedStory?.id ?? ''} onChange={(event) => setSelectedStoryId(event.target.value)}><option value="">Select a story</option>{stories.map((story) => <option value={story.id} key={story.id}>{story.title}</option>)}</select><ChevronDown size={14} /></div><button className="outline-button" onClick={splitIntoScenes}><WandSparkles size={15} /> Split text into scene drafts</button></div><div className="local-note"><Zap size={14} /><span>This first-pass splitter works locally on paragraph breaks. It does not call an AI model.</span></div>{scenes.filter((scene) => !selectedStory || scene.storyId === selectedStory.id).length ? <div className="scene-list">{scenes.filter((scene) => !selectedStory || scene.storyId === selectedStory.id).map((scene, index) => <button className={'scene-row ' + (selectedScene?.id === scene.id ? 'scene-selected' : '')} key={scene.id} onClick={() => setSelectedSceneId(scene.id)}><div className="scene-index">{String(index + 1).padStart(2, '0')}</div><div className="scene-main"><div className="scene-title-line"><h3>{scene.title}</h3><span className="draft-tag">{scene.status}</span></div><p>{scene.description || 'Add a short description to capture what happens in this scene.'}</p><span className="scene-meta"><Clock3 size={12} /> Scene draft · {scene.description.length.toLocaleString()} characters</span></div><ChevronRight size={17} className="muted-icon" /></button>)}</div> : <EmptyState icon={Clapperboard} title="Your first scene is waiting" text="Choose a story, then add a scene or split your imported text into local scene drafts." actionLabel="Add a scene" onAction={() => setModal('scene')} />}</section>}

        {page === 'AI Studio' && <section className="workspace-page">
          <PageIntro eyebrow="LOCAL INTELLIGENCE" title="Novel intelligence" description="Let a model running on your own machine help map the story before it becomes a manhwa." action={<button className="outline-button" onClick={connectLocalAI} disabled={aiStatus === 'checking'}>{aiStatus === 'checking' ? <LoaderCircle size={15} className="spin" /> : <RefreshCw size={15} />} {aiStatus === 'checking' ? 'Checking...' : 'Check connection'}</button>} />
          <div className="ai-status-card"><div className="ai-status-mark"><Cpu size={20} /></div><div className="ai-status-copy"><strong>Ollama local runtime</strong><span>Model berjalan di perangkat kamu. Tidak membutuhkan API key atau layanan AI berbayar.</span></div><div className="ai-status-state"><span className={'ai-status-light ' + aiStatus} />{aiStatus === 'connected' ? (aiModels.length ? 'CONNECTED · ' + aiModels.length + ' MODEL' : 'ONLINE · NO MODEL') : aiStatus === 'checking' ? 'CHECKING' : aiStatus === 'offline' ? 'OFFLINE' : 'NOT CHECKED'}</div></div>
          {aiError && <div className="ai-error"><X size={14} /><span>{aiError}</span></div>}
          <div className="ai-workspace-grid">
            <div className="panel-card ai-input-card"><div className="card-heading"><div><h3>Choose your novel</h3><p>Select an imported story and a local model.</p></div><span className="ai-local-tag">PRIVATE · LOCAL</span></div>
              <label className="ai-field">Story<select className="ai-select" value={selectedStory?.id ?? ''} onChange={(event) => { setSelectedStoryId(event.target.value); setAiAnalysis(null) }}><option value="">Select a story</option>{stories.map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}</select></label>
              <label className="ai-field">Local model<select className="ai-select" value={selectedAiModel} onChange={(event) => setSelectedAiModel(event.target.value)} disabled={!aiModels.length}><option value="">{aiModels.length ? 'Choose a model' : 'No model detected — check connection'}</option>{aiModels.map((model) => <option key={model} value={model}>{model}</option>)}</select></label>
              <div className="ai-source-preview"><div><span>TEXT SOURCE</span><span>{selectedStory?.content ? selectedStory.content.trim().split(/\s+/).filter(Boolean).length.toLocaleString() + ' WORDS' : 'NO TEXT'}</span></div><p>{selectedStory?.content.trim() ? selectedStory.content.slice(0, 420) + (selectedStory.content.length > 420 ? '…' : '') : 'Import a .txt or .md novel from My Stories. The local model will analyze the text you select here.'}</p></div>
              <button className="primary-button ai-run-button" onClick={analyzeWithLocalAI} disabled={!selectedStory?.content.trim() || !selectedAiModel || aiBusy}>{aiBusy ? <LoaderCircle size={16} className="spin" /> : <WandSparkles size={16} />}{aiBusy ? 'Analyzing locally...' : 'Analyze novel'}</button>
              <p className="ai-privacy-note"><Cloud size={13} /> Text is sent only to the Ollama service running on this computer.</p>
              {!stories.length && <button className="text-button ai-go-stories" onClick={() => go('My Stories')}>Go to My Stories <ArrowRight size={14} /></button>}
            </div>
            <div className="panel-card ai-results-card"><div className="card-heading"><div><h3>Story intelligence</h3><p>Review the model's suggestions before saving them.</p></div>{aiAnalysis?.storyId === selectedStory?.id && <span className="ai-result-tag">ANALYSIS READY</span>}</div>
              {aiAnalysis && aiAnalysis.storyId === selectedStory?.id ? <div className="ai-results-content">
                <div className="ai-summary-top"><span className="ai-result-label">GENRE</span><strong>{aiAnalysis.genre || 'Not identified'}</strong><div className="ai-logline">{aiAnalysis.logline || 'No logline returned.'}</div></div>
                <div className="ai-analysis-block"><div className="ai-block-heading"><h4>Synopsis</h4><button className="subtle-action" onClick={saveAnalysisSynopsis}>Save to story <Check size={13} /></button></div><p>{aiAnalysis.synopsis || 'The model did not return a synopsis.'}</p></div>
                <div className="ai-analysis-block"><h4>Core themes</h4><div className="ai-theme-list">{aiAnalysis.themes.length ? aiAnalysis.themes.map((theme, index) => <span className="ai-theme-chip" key={theme + index}>{theme}</span>) : <span className="ai-muted">No themes returned.</span>}</div></div>
                <div className="ai-analysis-block"><div className="ai-block-heading"><h4>Character candidates <span>{aiAnalysis.characters.length}</span></h4><button className="subtle-action" onClick={saveAnalysisCharacters}>Add to bible <Plus size={13} /></button></div>{aiAnalysis.characters.length ? <div className="ai-character-list">{aiAnalysis.characters.map((character) => <div className="ai-character-row" key={character.name}><div className="ai-character-avatar">{character.name.slice(0, 1).toUpperCase()}</div><div><strong>{character.name}</strong><span>{character.role}</span><p>{character.description}</p></div></div>)}</div> : <span className="ai-muted">No character candidates returned.</span>}</div>
                <div className="ai-analysis-block"><div className="ai-block-heading"><h4>Scene breakdown <span>{aiAnalysis.scenes.length}</span></h4><button className="subtle-action" onClick={saveAnalysisScenes} disabled={!aiAnalysis.scenes.length}>Add to storyboard <ArrowRight size={13} /></button></div>{aiAnalysis.scenes.length ? <div className="ai-scene-list">{aiAnalysis.scenes.map((scene, index) => <div className="ai-scene-row" key={scene.title + index}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{scene.title}</strong><p>{scene.summary}</p></div></div>)}</div> : <span className="ai-muted">No scenes returned.</span>}</div>
              </div> : <div className="ai-empty-results"><div className="ai-empty-icon"><Sparkles size={23} /></div><h3>Your story, understood.</h3><p>Connect Ollama, select a novel and model, then run your first local analysis. Results will appear here.</p></div>}
            </div>
          </div>
        </section>}

        {page === 'Panel Editor' && <section className="workspace-page"><PageIntro eyebrow="PRODUCTION WORKSPACE" title="Panel editor" description="Arrange the visual beats of a scene before turning them into finished artwork." action={<button className="primary-button" onClick={() => go('Storyboard')}><ArrowLeft size={16} /> Back to storyboard</button>} /><div className="editor-intro"><div className="editor-intro-icon"><FileImage size={22} /></div><div><span className="eyebrow">EPISODE CANVAS</span><h2>{selectedScene?.title ?? 'No scene selected yet'}</h2><p>{selectedScene?.description ?? 'Create a scene in Storyboard to start planning your comic panels.'}</p></div></div><div className="panel-canvas-grid">{[1, 2, 3].map((number) => <div className="comic-panel" key={number}><span className="panel-number">PANEL 0{number}</span><div className="panel-placeholder"><ImagePlus size={23} /><span>ARTWORK GOES HERE</span><small>Visual generation · planned</small></div><div className="panel-caption"><MessageSquareText size={14} /><span>Add dialogue or a caption...</span></div></div>)}</div><div className="editor-bottom-note"><Sparkles size={15} /><span>The panel canvas is a layout prototype. Local image generation and export will be connected after the workspace foundation is ready.</span></div></section>}
      </div>
    </main>

    {modal && <ModalShell title={modal === 'story' ? 'Start a new story' : modal === 'character' ? 'Add a character' : modal === 'style' ? 'Add art reference' : 'Create a scene'} subtitle={modal === 'story' ? 'Give your next world a name.' : modal === 'character' ? 'Add someone readers will remember.' : modal === 'style' ? 'Save a visual reference for your future art direction.' : 'Capture one moment in your story.'} onClose={resetModal}>
      {modal === 'story' && <form onSubmit={createStory} className="modal-form"><label>Story title<input autoFocus value={storyTitle} onChange={(event) => setStoryTitle(event.target.value)} placeholder="e.g. The Garden of Ashes" required /></label><label>Short synopsis <span className="optional-label">OPTIONAL</span><textarea value={storySynopsis} onChange={(event) => setStorySynopsis(event.target.value)} placeholder="What is this story about?" rows={3} /></label><div className="modal-hint"><BookPlus size={15} /> You can import the full novel as a .txt or .md file after creating it.</div><div className="modal-actions"><button type="button" className="text-button" onClick={resetModal}>Cancel</button><button type="submit" className="primary-button">Create story <ArrowRight size={15} /></button></div></form>}
      {modal === 'character' && <form onSubmit={createCharacter} className="modal-form"><label>Character name<input autoFocus value={characterName} onChange={(event) => setCharacterName(event.target.value)} placeholder="e.g. Seo Yuna" required /></label><label>Role<select value={characterRole} onChange={(event) => setCharacterRole(event.target.value)}><option>Main character</option><option>Deuteragonist</option><option>Antagonist</option><option>Supporting character</option><option>Other</option></select></label><label>Appearance & personality notes<textarea value={characterDescription} onChange={(event) => setCharacterDescription(event.target.value)} placeholder="Describe their look, personality, motivations, and important details..." rows={4} /></label><div className="modal-actions"><button type="button" className="text-button" onClick={resetModal}>Cancel</button><button type="submit" className="primary-button">Save character <ArrowRight size={15} /></button></div></form>}
      {modal === 'style' && <form onSubmit={createStyle} className="modal-form"><label>Reference name<input autoFocus value={styleName} onChange={(event) => setStyleName(event.target.value)} placeholder="e.g. Soft cinematic romance" required /></label><label>Reference image <span className="optional-label">OPTIONAL</span><input className="file-input" type="file" accept="image/*" onChange={(event) => setStyleFile(event.target.files?.[0] ?? null)} /><span className="field-help">{styleFile ? styleFile.name : 'Choose a JPG, PNG, or WEBP image from your device.'}</span></label><label>What do you want to remember about this style?<textarea value={styleNotes} onChange={(event) => setStyleNotes(event.target.value)} placeholder="Linework, color palette, lighting, atmosphere, character proportions..." rows={3} /></label><div className="modal-actions"><button type="button" className="text-button" onClick={resetModal}>Cancel</button><button type="submit" className="primary-button">Save reference <ArrowRight size={15} /></button></div></form>}
      {modal === 'scene' && <form onSubmit={createScene} className="modal-form"><label>Scene title<input autoFocus value={sceneTitle} onChange={(event) => setSceneTitle(event.target.value)} placeholder="e.g. The unexpected encounter" required /></label><label>What happens in this scene?<textarea value={sceneDescription} onChange={(event) => setSceneDescription(event.target.value)} placeholder="Describe the action, emotion, setting, and important dialogue..." rows={4} /></label><div className="modal-hint"><BookOpen size={15} /> {selectedStory ? 'This scene will be linked to ' + selectedStory.title + '.' : 'Create a story first to organize scenes by story.'}</div><div className="modal-actions"><button type="button" className="text-button" onClick={resetModal}>Cancel</button><button type="submit" className="primary-button">Add scene <ArrowRight size={15} /></button></div></form>}
    </ModalShell>}
  </div>
}

function StatCard({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return <div className="stat-card"><div className="stat-top"><span className="stat-icon"><Icon size={17} /></span><span className="stat-trend">YOUR STUDIO</span></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-detail">{detail}</div></div>
}
function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action: ReactNode }) {
  return <div className="page-heading workspace-heading"><div><div className="eyebrow"><Sparkles size={13} /> {eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>
}
function StoryRow({ story, onClick }: { story: Story; onClick: () => void }) {
  return <button className="story-row" onClick={onClick}><div className="mini-cover"><span>✳</span></div><div className="story-row-copy"><strong>{story.title}</strong><small>{story.synopsis || 'No synopsis added yet.'}</small></div><span className="row-date">{new Date(story.createdAt).toLocaleDateString()}</span><ChevronRight size={16} className="muted-icon" /></button>
}
function EmptyInline({ icon: Icon, title, text, action, onClick }: { icon: LucideIcon; title: string; text: string; action: string; onClick: () => void }) {
  return <div className="empty-inline"><div className="empty-icon"><Icon size={20} /></div><div><strong>{title}</strong><p>{text}</p><button className="inline-link" onClick={onClick}>{action} <ArrowRight size={13} /></button></div></div>
}
function EmptyState({ icon: Icon, title, text, actionLabel, onAction }: { icon: LucideIcon; title: string; text: string; actionLabel: string; onAction: () => void }) {
  return <div className="empty-state"><div className="empty-state-art"><div className="empty-orbit" /><div className="empty-state-icon"><Icon size={25} /></div><span className="empty-spark">✳</span></div><h3>{title}</h3><p>{text}</p><button className="primary-button" onClick={onAction}>{actionLabel} <ArrowRight size={15} /></button></div>
}
function ModalShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="modal-card"><div className="modal-top"><div><div className="eyebrow">MANHWA STUDIO</div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={18} /></button></div>{children}</div></div>
}
