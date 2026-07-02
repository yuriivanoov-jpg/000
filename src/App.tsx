import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  MessageSquare, 
  Image as ImageIcon, 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Layers, 
  Cpu, 
  Eye, 
  X, 
  PlusCircle, 
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings 
} from 'lucide-react';
import { Mode, Message, Agent, RenderProject } from './types';
import { AI_AGENTS, PROJECTS } from './data';

const TRANSLATIONS = {
  en: {
    projectWorkspace: "Project Workspace",
    methodProcessor: "Method Processor",
    biasFactor: "Bias Factor",
    matrixParams: "Matrix Params",
    generateRender: "GENERATE RENDER",
    processing: "PROCESSING...",
    aiDesignCompanions: "AI Design Companions",
    consultants: "Consultants",
    consultantsSub: "Tap any specialized architecture agent to begin a live design dialogue. Powered by Gemini.",
    replyPlaceholder: "Reply to {name}...",
    fee: "Fee",
    showcaseShowroom: "Showcase Showroom",
    portfolio: "Portfolio",
    portfolioSub: "Click any project card to review structural configurations, styling scripts, and material weights.",
    customRendersAvailable: "Custom Renders Available",
    customRendersSub: "Use our visualizer studio tab to generate completely custom renders! Newly produced designs will automatically load into this gallery portfolio context.",
    interactiveWorkspace: "Interactive Workspace",
    scale: "Scale: {scale}x | Drag to explore details",
    fineScale: "Fine Scale",
    out: "Out",
    zoomIn: "In",
    reset: "Reset",
    compare: "Compare",
    projectUrl: "Project ID",
    statusPostProcessed: "POST_PROCESSED_ACTIVE",
    statusDraft: "DEFAULT_DRAFT_ACTIVE",
    wheelHint: "Use mousewheel or drag with finger",
    studio: "Studio",
    aiAgents: "AI Agents",
    gallery: "Gallery",
    settings: "Settings",
    language: "Interface Language",
    agentsLangHint: "AI Agents will respond in English",
    close: "Close"
  },
  ru: {
    projectWorkspace: "Рабочая область",
    methodProcessor: "Метод обработки",
    biasFactor: "Коэффициент влияния",
    matrixParams: "Параметры стилей",
    generateRender: "СОЗДАТЬ РЕНДЕР",
    processing: "ОБРАБОТКА...",
    aiDesignCompanions: "Ассистенты дизайна",
    consultants: "ИИ-консультанты",
    consultantsSub: "Выберите эксперта-архитектора для начала живого диалога. На базе Gemini.",
    replyPlaceholder: "Ответить {name}...",
    fee: "Плата",
    showcaseShowroom: "Выставка работ",
    portfolio: "Портфолио",
    portfolioSub: "Нажмите на проект, чтобы увидеть настройки структуры, параметры стилей и вес материалов.",
    customRendersAvailable: "Доступны новые рендеры",
    customRendersSub: "Используйте вкладку Студия для создания уникальных рендеров! Новые результаты автоматически сохраняются в портфолио.",
    interactiveWorkspace: "Интерактивная область",
    scale: "Масштаб: {scale}x | Перетаскивайте для изучения деталей",
    fineScale: "Тонкая шкала",
    out: "Удалить",
    zoomIn: "Приблизить",
    reset: "Сбросить",
    compare: "Сравнить",
    projectUrl: "ID проекта",
    statusPostProcessed: "РЕНДЕР_ПОСТОБРАБОТКИ",
    statusDraft: "ИСХОДНЫЙ_ЭСКИЗ",
    wheelHint: "Используйте колесо мыши или пальцы для масштаба",
    studio: "Студия",
    aiAgents: "Ассистенты ИИ",
    gallery: "Галерея",
    settings: "Настройки",
    language: "Язык интерфейса",
    agentsLangHint: "ИИ-ассистенты будут отвечать на русском",
    close: "Закрыть"
  }
};

export default function App() {
  // Navigation & Core states
  const [activeTab, setActiveTab] = useState<'studio' | 'agents' | 'chat' | 'gallery'>('studio');
  const [balance, setBalance] = useState(50.00);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Studio visualizer parameters
  const [selectedMode, setSelectedMode] = useState<Mode>('CANNY');
  const [biasFactor, setBiasFactor] = useState(60);
  const [matrixParams, setMatrixParams] = useState('--minimalism --warm-light --tactile-oak');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  
  // Custom project image overrides (stores generated renders)
  const [projectImages, setProjectImages] = useState<{ [key: string]: string }>({});

  // Zoom & Pan interactive states for main render image
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.5);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setPanOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomIntensity = 0.12;
    const direction = e.deltaY < 0 ? 1 : -1;
    setZoomScale(prev => {
      const newScale = Math.min(Math.max(prev + direction * zoomIntensity, 1), 6);
      return newScale;
    });
  };

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.3, 6));
    triggerHaptic('light');
  };

  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(prev - 0.3, 1);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
    triggerHaptic('light');
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    triggerHaptic('medium');
  };

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Unified Chat States
  const [unifiedChat, setUnifiedChat] = useState<Message[]>([]);
  const [chatTarget, setChatTarget] = useState<string>('all'); // 'all', 'clara', 'kaelen', 'sienna', 'dax'
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  // Screen layout and formatting states
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Chat Sub-tabs
  const [subChatTab, setSubChatTab] = useState<'general' | 'specs'>('general');

  // Interactive specifications list (ТЗ и референсы)
  const [specsList, setSpecsList] = useState<Array<{ id: string; text: string; image?: string; timestamp: string }>>([
    {
      id: 'default-spec-1',
      text: 'ТЗ №1: Интегрировать панорамное остекление в гостиную лофта. Минимизировать прямые световые потоки, добавить скрытые LED-профили (2700K).',
      timestamp: 'Вчера, 18:40',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'default-spec-2',
      text: 'Референс материалов: Сочетание шлифованного бетона с брашированным американским орехом и грубым льном в обивке.',
      timestamp: 'Сегодня, 10:15',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=300'
    }
  ]);

  const [isTrainingActive, setIsTrainingActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery view state
  const [selectedGalleryProject, setSelectedGalleryProject] = useState<RenderProject | null>(null);

  // Clock state for real-time vibe
  const [timeStr, setTimeStr] = useState('14:02');

  // Chat scroll container ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours() + 3).padStart(2, '0'); // UTC+3 Moscow time simulation
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Set initial project details on load
  useEffect(() => {
    const proj = PROJECTS[currentProjectIndex];
    setSelectedMode(proj.method);
    setBiasFactor(proj.bias);
    setMatrixParams(proj.params);
  }, [currentProjectIndex]);

  // Expand WebApp on mount
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.expand();
        tg.setHeaderColor('#0b0a0d');
      }
    } catch (e) {
      // Ignore if not in Telegram iframe
    }
  }, []);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [unifiedChat, isAgentTyping, activeTab]);

  // Synchronize initial messages when language changes, for the unified group chat if no user messages exist
  useEffect(() => {
    const hasUserMessages = unifiedChat.some(msg => msg.sender === 'user');
    if (!hasUserMessages) {
      const welcomeMessages: Message[] = AI_AGENTS.map((agent, index) => {
        const text = lang === 'ru' ? (agent.initialMessageRu || agent.initialMessage) : agent.initialMessage;
        return {
          id: `welcome-${agent.id}-${index}`,
          sender: agent.id,
          senderName: lang === 'ru' ? (agent.nameRu || agent.name) : agent.name,
          senderAvatar: agent.avatar,
          text: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      setUnifiedChat(welcomeMessages);
    }
  }, [lang]);

  // Haptic feedback trigger helper
  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'selection' = 'medium') => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        if (style === 'selection') {
          tg.HapticFeedback.selectionChanged();
        } else {
          tg.HapticFeedback.impactOccurred(style);
        }
      }
    } catch (e) {}
  };

  // Easter Egg: Tap balance to top up credits
  const handleTopUp = () => {
    triggerHaptic('heavy');
    setBalance(prev => prev + 25.00);
  };

  // AI Render Generation handler
  const handleGenerateRender = () => {
    if (balance < 5.00 || isGenerating) return;
    
    triggerHaptic('heavy');
    setIsGenerating(true);
    setGenerationStep(1);

    // List of high-quality mock architectural renders from Unsplash to feed back
    const outputOptions: { [key: string]: string[] } = {
      loft: [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
      ],
      villa: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200'
      ],
      penthouse: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200'
      ]
    };

    const currentProject = PROJECTS[currentProjectIndex];

    // Cinematic generation stages
    setTimeout(() => {
      setGenerationStep(2);
      triggerHaptic('medium');
      
      setTimeout(() => {
        setGenerationStep(3);
        triggerHaptic('medium');
        
        setTimeout(() => {
          setIsGenerating(false);
          setGenerationStep(0);
          setBalance(prev => Math.max(0, prev - 5.00));
          
          // Select random render image for this project
          const renders = outputOptions[currentProject.id] || outputOptions['loft'];
          const randomIdx = Math.floor(Math.random() * renders.length);
          const newImage = renders[randomIdx];

          // Save the render image state
          setProjectImages(prev => ({
            ...prev,
            [currentProject.id]: newImage
          }));

          triggerHaptic('heavy');
        }, 1500);
      }, 1500);
    }, 1200);
  };

  // Navigates to an agent's chat
  const startChatting = (agent: Agent) => {
    triggerHaptic('selection');
    setChatTarget(agent.id);
    setActiveTab('chat');
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'ru' ? 'Пожалуйста, выберите изображение.' : 'Please select an image file.');
      return;
    }

    setIsUploading(true);
    triggerHaptic('light');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      setIsUploading(false);
      triggerHaptic('medium');
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Intelligent local responder in case Gemini is offline or API key is absent
  const simulateLocalResponse = (agent: Agent, prompt: string): string => {
    const text = prompt.toLowerCase();
    
    if (lang === 'ru') {
      // Clara Vance (Architect) local smart answers
      if (agent.id === 'clara') {
        if (text.includes('loft') || text.includes('лофт') || text.includes('стиль')) {
          return "Стиль лофт представляет собой диалог между суровой индустриальной историей здания и современным интерьерным комфортом. Я рекомендую дополнить кирпич теплым дубовым полом, низкими итальянскими диванами и непрерывной игрой теплых теней вдоль потолочных балок.";
        }
        if (text.includes('wood') || text.includes('дерево') || text.includes('материал')) {
          return "Я предпочитаю матовый, брашированный ясень или американский темный орех. Они поглощают блики и создают мягкую, насыщенную текстуру волокон, которая ощущается невероятно приятно при ходьбе босиком и визуально успокаивает.";
        }
        return "Это вдохновляющая концепция. При планировании такой конфигурации помните о важности архитектурных видовых осей. Давайте оставим центральное пространство открытым, чтобы воздух и свет циркулировали свободно.";
      }

      // Kaelen Voss (Light Specialist) local smart answers
      if (agent.id === 'kaelen') {
        if (text.includes('свет') || text.includes('окно') || text.includes('освещ') || text.includes('ламп')) {
          return "Для таких пространств прямое ослепляющее верхнее освещение — наш главный враг. Вместо этого нам следует использовать скрытую линейную подсветку карнизов и напольные светильники мягкого теплого спектра (2700К). Это окутает стены нежной атмосферной дымкой.";
        }
        if (text.includes('render') || text.includes('вечер') || text.includes('закат')) {
          return "В сумерках естественный синий свет атмосферы сливается с теплыми лучами интерьера. Я предлагаю симулировать это, увеличив контрастность и удерживая коэффициент влияния около 45% для сохранения глубоких бархатистых теней.";
        }
        return "Свет — это холст нашего физического мира. Чтобы достичь идеального мягкого свечения, мы должны отражать основные источники света от текстурированной глиняной штукатурки или колонн из открытого бетона.";
      }

      // Sienna Rose (Materials) local smart answers
      if (agent.id === 'sienna') {
        if (text.includes('бетон') || text.includes('concrete') || text.includes('плит')) {
          return "Необработанный бетон становится мягким, когда он сбалансирован органическим льном и шлифованной теплой бронзой. Пол из микроцемента, обработанный матовым шелковистым герметиком, станет идеальным архитектурным холстом.";
        }
        if (text.includes('цвет') || text.includes('color') || text.includes('палитр')) {
          return "Давайте исследуем спокойную, восстанавливающую палитру: теплый травертин, овсяное букле, цинковые акценты ручной шлифовки и глубокий лесной вельвет для заземления всей композиции.";
        }
        return "Материалы говорят с нашим подсознанием. Я рекомендую наслаивать текстуры, а не цвета. Сочетание грубого открытого дуба с прохладным, гладким известняком создает потрясающее визуальное напряжение.";
      }

      // Dax Chen (Ergonomics/ blue print) local smart answers
      if (agent.id === 'dax') {
        if (text.includes('план') || text.includes('размер') || text.includes('мебе')) {
          return "Для свободного перемещения человека требуются проходы шириной не менее 90 см. Мы можем разместить парящий низкий диван в качестве мягкой перегородки, разделяя гостиную зону без перекрытия визуального горизонта.";
        }
        return "Планировка проверена. Наша главная цель — минимизировать когнитивную нагрузку при ежедневных перемещениях. Я предлагаю сделать системы хранения встроенными заподлицо со стенами, чтобы сохранить непрерывную гладкую плоскость.";
      }

      return `Ассистент Atelier AI активирован: это прекрасное направление дизайна. Чтобы воплотить его в жизнь, сосредоточьтесь на мягких коэффициентах контрастности, сбалансированных текстурах материалов и кастомном коэффициенте влияния ${(biasFactor / 100).toFixed(2)}.`;
    } else {
      // English fallback
      if (agent.id === 'clara') {
        if (text.includes('loft') || text.includes('style')) {
          return "The loft style represents a dialogue between structural raw history and modern interior comfort. I recommend framing the brick with warm oak flooring, low-slung Italian lounges, and continuous warm shadow play along the ceiling columns.";
        }
        if (text.includes('wood') || text.includes('material')) {
          return "I prefer matte, wire-brushed ash or smoked American walnut. They absorb glare and provide a soft, rich grain texture that feels incredibly gentle underfoot and visually soothing.";
        }
        return "That's an inspiring concept. When laying out this configuration, remember to honor the architectural sightlines. Let's keep the core spatial axis completely open to let air and light flow freely.";
      }
      if (agent.id === 'kaelen') {
        if (text.includes('light') || text.includes('window') || text.includes('lamp')) {
          return "For spaces like this, direct overhead glare is our enemy. We should instead employ indirect floor-washers and concealed linear cove profiles (at 2700K warmth). This wraps the walls in a soft, atmospheric mist of photons.";
        }
        if (text.includes('render') || text.includes('dusk')) {
          return "At dusk, the natural blue light of the atmosphere blends with warm interior rays. I suggest simulating this by boosting the warm contrast factors and keeping the bias factor around 45% to retain deep, velvety shadow values.";
        }
        return "Light is the canvas of our physical world. To achieve the perfect soft lighting, we should bounce our key illumination sources off textured clay plaster or open concrete columns.";
      }
      if (agent.id === 'sienna') {
        if (text.includes('concrete') || text.includes('stone')) {
          return "Raw concrete becomes gentle when balanced with organic linen and brushed warm bronze. A micro-cement floor treated with a matte silk sealer offers the perfect architectural slate.";
        }
        if (text.includes('color') || text.includes('palette')) {
          return "Let's explore a quiet, restorative palette: off-white travertine, warm oatmeal boucle, hand-brushed zinc accents, and a touch of deep forest velvet to ground the compositions.";
        }
        return "Materials speak to our subconscious. I recommend layering textures rather than colors. Combining a rough open-grain walnut with smooth, cold limestone creates beautiful visual tension.";
      }
      if (agent.id === 'dax') {
        if (text.includes('blueprint') || text.includes('layout') || text.includes('furniture')) {
          return "Optimal human movement requires clear 90cm corridors. We can place a floating low-backed sectional to act as a soft partition, defining the living zone without blocking the visual horizon.";
        }
        return "Layout validated. Our core objective is minimizing cognitive load during daily flow vectors. I suggest tucking storage flush into partition walls, maintaining a continuous sleek surface.";
      }
      return `Atelier AI Assistant activated: That is a wonderful design avenue. To bring this specific design to life, try focusing on soft contrast ratios, balanced material textures, and a custom bias factor of ${(biasFactor / 100).toFixed(2)}.`;
    }
  };

  // Sending Chat message handler (triggers real Gemini API on Express backend!)
  const handleSendMessage = async () => {
    const userText = messageInput.trim();
    if (!userText && !selectedImage) return;

    if (subChatTab === 'specs') {
      setMessageInput('');
      const currentImg = selectedImage;
      setSelectedImage(null);
      triggerHaptic('heavy');

      const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newSpecItem = {
        id: 'spec-' + Date.now(),
        text: userText || (lang === 'ru' ? 'Загружено визуальное требование / референс' : 'Uploaded visual spec / reference'),
        image: currentImg || undefined,
        timestamp: lang === 'ru' ? 'Сегодня, ' + timestampStr : 'Today, ' + timestampStr
      };

      setSpecsList(prev => [...prev, newSpecItem]);

      // Trigger beautiful visual animation of training active
      setIsTrainingActive(true);
      setTimeout(() => {
        setIsTrainingActive(false);
      }, 1500);
      return;
    }

    if (isAgentTyping) return;

    setMessageInput('');
    const currentImg = selectedImage;
    setSelectedImage(null);
    triggerHaptic('medium');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      senderName: lang === 'ru' ? 'Клиент' : 'Client',
      text: userText,
      timestamp,
      image: currentImg || undefined
    };

    // Update local chat history for the active agent
    const updatedChat = [...unifiedChat, userMsg];
    setUnifiedChat(updatedChat);

    // Cost 1 credit for AI interaction
    setBalance(prev => Math.max(0, prev - 1.00));
    setIsAgentTyping(true);

    // Pick target agent for character response
    let targetAgent = AI_AGENTS[0]; // Clara Vance default
    if (chatTarget !== 'all') {
      targetAgent = AI_AGENTS.find(a => a.id === chatTarget) || AI_AGENTS[0];
    } else {
      // Intelligent keyword routing
      const lowerText = userText.toLowerCase();
      if (lowerText.includes('свет') || lowerText.includes('лампа') || lowerText.includes('освещ') || lowerText.includes('light') || lowerText.includes('lux') || lowerText.includes('lamp') || lowerText.includes('лучи') || lowerText.includes('тень') || lowerText.includes('shadow')) {
        targetAgent = AI_AGENTS.find(a => a.id === 'kaelen') || targetAgent;
      } else if (lowerText.includes('материал') || lowerText.includes('камень') || lowerText.includes('дерево') || lowerText.includes('плитк') || lowerText.includes('микроцемент') || lowerText.includes('ткань') || lowerText.includes('concrete') || lowerText.includes('stone') || lowerText.includes('wood') || lowerText.includes('texture') || lowerText.includes('латунь') || lowerText.includes('метал')) {
        targetAgent = AI_AGENTS.find(a => a.id === 'sienna') || targetAgent;
      } else if (lowerText.includes('планир') || lowerText.includes('размер') || lowerText.includes('мебель') || lowerText.includes('эргоном') || lowerText.includes('чертеж') || lowerText.includes('проход') || lowerText.includes('layout') || lowerText.includes('dimensions') || lowerText.includes('furniture') || lowerText.includes('flow') || lowerText.includes('blueprint')) {
        targetAgent = AI_AGENTS.find(a => a.id === 'dax') || targetAgent;
      }
    }

    setTypingAgent(lang === 'ru' ? (targetAgent.nameRu || targetAgent.name) : targetAgent.name);

    try {
      // Build previous context for Gemini to maintain conversation memory!
      const recentHistory = updatedChat
        .slice(-6) // take last 6 messages
        .map(m => `${m.senderName || m.sender}: ${m.text}`)
        .join('\n');

      const baseInstruction = lang === 'ru' ? (targetAgent.systemInstructionRu || targetAgent.systemInstruction) : targetAgent.systemInstruction;
      
      // Inject training specifications dynamically into agent memory
      const specsContext = specsList.length > 0 
        ? `\n\n[NEURAL TRAINING MEMORY]: The user has uploaded the following design specifications and references. You MUST incorporate these criteria into your professional evaluations and design suggestions:
${specsList.map((s, idx) => `- Spec #${idx+1}: ${s.text} ${s.image ? '(Visual reference provided)' : ''}`).join('\n')}`
        : '';

      const systemPrompt = `${baseInstruction}${specsContext}\n\nYou are participating in a group design conversation with other experts. You are replying as ${targetAgent.name}, ${targetAgent.role}. Respond directly to the user's inquiry or comment, referencing other members if helpful. Maintain your character. You MUST respond ONLY in ${lang === 'ru' ? 'Russian' : 'English'}. Keep your answer concise, exceptionally creative, elegant, highly descriptive of design/architecture, and strictly under 3 short paragraphs.`;

      const promptPayload = `This is a live chat with the user in our architectural studio app.
Recent Chat History:
${recentHistory}

User's new message: "${userText}"
${currentImg ? '[An image is attached to this message]' : ''}

Elegant in-character response:`;

      // Make actual server-side API call
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptPayload,
          systemInstruction: systemPrompt,
          image: currentImg || undefined
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      const agentReply: Message = {
        id: 'agent-' + Date.now(),
        sender: targetAgent.id,
        senderName: lang === 'ru' ? (targetAgent.nameRu || targetAgent.name) : targetAgent.name,
        senderAvatar: targetAgent.avatar,
        text: data.text || simulateLocalResponse(targetAgent, userText),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setUnifiedChat(prev => [...prev, agentReply]);

    } catch (err) {
      console.warn("Gemini API server call failed. Falling back to offline-intelligent responder.", err);
      // Fallback local smart response simulation
      setTimeout(() => {
        const localReplyText = simulateLocalResponse(targetAgent, userText);
        const agentReply: Message = {
          id: 'agent-' + Date.now(),
          sender: targetAgent.id,
          senderName: lang === 'ru' ? (targetAgent.nameRu || targetAgent.name) : targetAgent.name,
          senderAvatar: targetAgent.avatar,
          text: localReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setUnifiedChat(prev => [...prev, agentReply]);
        setIsAgentTyping(false);
        setTypingAgent(null);
        triggerHaptic('light');
      }, 1500);
      return;
    }

    setIsAgentTyping(false);
    setTypingAgent(null);
    triggerHaptic('light');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const currentProject = PROJECTS[currentProjectIndex];
  const displayedProjectImage = projectImages[currentProject.id] || currentProject.image;

  return (
    <div id="atelier-app-root" className={`w-full h-screen bg-bg relative flex flex-col overflow-hidden transition-all duration-300 rounded-none border-none shadow-none ${theme === 'light' ? 'light' : ''}`}>
      
      {/* ATELIER OS Header status line */}
      <header id="atelier-header" className="px-6 pt-5 pb-3 flex justify-between items-center shrink-0 border-b border-white/[0.03] bg-bg z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent/80 animate-pulse" />
          <span className="font-display font-bold text-xs tracking-wider text-ink uppercase">
            {lang === 'ru' ? 'АТЕЛЬЕ ИИ' : 'ATELIER AI'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Clickable balance credit badge */}
          <button 
            id="credit-badge"
            onClick={handleTopUp}
            className="flex items-center gap-1.5 bg-accent-soft hover:bg-accent/20 border border-accent/20 px-2.5 py-1 rounded-none cursor-pointer transition-all active:scale-95 group"
            title="Click to recharge credits"
          >
            <Cpu className="w-3 h-3 text-accent animate-spin-slow group-hover:scale-110 transition-transform" />
            <span className="font-mono text-[10px] font-medium text-accent tracking-[0.05em]">{balance.toFixed(2)} CR</span>
          </button>

          {/* Settings button */}
          <button
            id="settings-button"
            onClick={() => { triggerHaptic('light'); setIsSettingsOpen(true); }}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-ink-medium hover:text-ink rounded-none border border-white/5 cursor-pointer transition-all"
            title="Settings / Настройки"
          >
            <Settings className="w-4 h-4 animate-hover-spin" />
          </button>
        </div>
      </header>

      {/* Main Container Viewport */}
      <div id="atelier-viewport" className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: STUDIO (Render visualizer page) */}
          {activeTab === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar pb-24"
            >
              {/* Project Index selector */}
              <div id="studio-meta" className="flex justify-between items-start mb-6">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">● {TRANSLATIONS[lang].projectWorkspace}</span>
                  <h2 className="font-display text-[2rem] leading-[1.0] uppercase mt-2 tracking-[-0.04em] font-extrabold max-w-[280px]">
                    {lang === 'ru' ? (currentProject.nameRu || currentProject.name) : currentProject.name}
                  </h2>
                </div>
                
                {/* Project carousel arrow switcher */}
                <div className="flex gap-2 bg-white/5 p-1.5 rounded-full border border-white/5">
                  {PROJECTS.map((p, idx) => (
                    <button
                      key={p.id}
                      id={`project-btn-${p.id}`}
                      onClick={() => { setCurrentProjectIndex(idx); triggerHaptic('selection'); }}
                      className={`w-8 h-8 rounded-full font-mono text-xs flex items-center justify-center transition-all cursor-pointer ${
                        currentProjectIndex === idx 
                          ? 'bg-accent text-bg font-bold' 
                          : 'text-ink-medium hover:bg-white/5 hover:text-ink'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Viewport Frame (Simulated 3D Engine Output) */}
              <div 
                id="render-viewport-container" 
                onClick={() => {
                  if (!isGenerating) {
                    triggerHaptic('medium');
                    setIsZoomModalOpen(true);
                    setZoomScale(1.5);
                    setPanOffset({ x: 0, y: 0 });
                  }
                }}
                className={`relative w-full aspect-[4/3] bg-[#141217] overflow-hidden rounded-2xl mb-6 shadow-2xl group border border-white/[0.04] transition-all duration-300 ${isGenerating ? 'cursor-not-allowed' : 'cursor-zoom-in hover:border-accent/40 hover:shadow-[0_0_24px_rgba(255,118,87,0.15)]'}`}
              >
                {/* Corner decorative marks for OS aesthetics */}
                <div className="absolute top-2 left-2 w-2 h-2 border border-accent/40 border-r-0 border-b-0 z-10 transition-colors group-hover:border-accent" />
                <div className="absolute top-2 right-2 w-2 h-2 border border-accent/40 border-l-0 border-b-0 z-10 transition-colors group-hover:border-accent" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border border-accent/40 border-r-0 border-t-0 z-10 transition-colors group-hover:border-accent" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border border-accent/40 border-l-0 border-t-0 z-10 transition-colors group-hover:border-accent" />
                
                {/* Visualizer focus overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(11,10,13,0.35)_100%)] pointer-events-none z-10" />
                
                {/* Progress bar and processing animation */}
                {isGenerating && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-[1.5px] bg-accent/30 pointer-events-none z-10 scanline-anim" />
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-accent/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                      <span className="font-mono text-[8px] tracking-[0.1em] text-accent uppercase font-medium">
                        {lang === 'ru' ? 'РЕНДЕРИНГ GPU...' : 'GPU.RENDERING...'}
                      </span>
                    </div>
                  </>
                )}

                {/* Main Render Image */}
                <img 
                  id="rendered-image"
                  src={displayedProjectImage} 
                  alt="architectural visualization" 
                  className={`w-full h-full object-cover filter transition-all duration-700 select-none ${
                    isGenerating ? 'saturate-0 blur-[2px] scale-[1.01]' : 'saturate-[0.8] contrast-[1.05] brightness-[0.95] group-hover:scale-102'
                  }`}
                />

                {/* Interactive Click Hint Badge */}
                {!isGenerating && (
                  <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-bg/85 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 opacity-70 group-hover:opacity-100 group-hover:border-accent/40 transition-all">
                    <Maximize2 className="w-3 h-3 text-accent animate-pulse" />
                    <span className="font-mono text-[8px] tracking-[0.08em] text-ink uppercase">
                      {lang === 'ru' ? 'Масштабировать' : 'Zoom & Pan'}
                    </span>
                  </div>
                )}
                
                {/* Bottom dark shade layout */}
                <div className="absolute bottom-0 w-full h-[25%] bg-gradient-to-t from-[#131217] to-transparent pointer-events-none" />

                {/* Rendering screen overlays with AnimatePresence */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center"
                    >
                      <span className="font-mono text-[10px] tracking-[0.15em] text-accent font-medium mb-1 animate-pulse">
                        {generationStep === 1 ? (lang === 'ru' ? 'СТРОИМ Чертежи' : 'CONSTRUCTING Blueprints') : generationStep === 2 ? (lang === 'ru' ? 'РАССЧИТЫВАЕМ Векторы глубины' : 'SOLVING Depth Vectors') : (lang === 'ru' ? 'ДЕКОРИРУЕМ Поверхности' : 'DECORATING Surfaces')}
                      </span>
                      <span className="font-mono text-[8px] text-ink-medium uppercase tracking-wider">
                        {generationStep === 1 ? (lang === 'ru' ? 'Построение векторов по методу ' + selectedMode : 'Mapping vectors via ' + selectedMode) : generationStep === 2 ? (lang === 'ru' ? 'Расчет трассировки теней' : 'Computing shadow ray-tracing') : (lang === 'ru' ? 'Применение ' + matrixParams : 'Applying ' + matrixParams)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls area */}
              <div id="studio-controls" className="flex flex-col gap-5">
                {/* Description */}
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                  <p className="text-[11px] text-ink-medium leading-relaxed font-sans">
                    {lang === 'ru' ? (currentProject.descriptionRu || currentProject.description) : currentProject.description}
                  </p>
                </div>

                {/* Mode Selector */}
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-medium block mb-2.5">
                    {TRANSLATIONS[lang].methodProcessor}
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-white/[0.05] p-1 rounded-lg border border-white/[0.04]">
                    {(['CANNY', 'DEPTH', 'LINE'] as Mode[]).map(m => (
                      <button 
                        key={m}
                        id={`mode-chip-${m}`}
                        onClick={() => { setSelectedMode(m); triggerHaptic('selection'); }}
                        className={`py-3 rounded-md font-mono text-xs font-bold border-none cursor-pointer transition-all duration-300 ${
                          selectedMode === m 
                            ? 'bg-accent text-bg glow-accent' 
                            : 'text-ink-medium hover:text-ink hover:bg-white/[0.02]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bias Factor Range Slider */}
                <div className="flex flex-col gap-3 bg-white/[0.01] border border-white/[0.03] p-4.5 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-medium">
                      {TRANSLATIONS[lang].biasFactor}
                    </span>
                    <span className="font-mono text-[11px] text-accent font-bold">{(biasFactor / 100).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    id="bias-slider"
                    min="10" max="100" 
                    value={biasFactor} 
                    onChange={(e) => setBiasFactor(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/[0.06] rounded-full appearance-none outline-none accent-accent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                {/* Matrix parameters text inputs */}
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-medium block mb-2">
                    {TRANSLATIONS[lang].matrixParams}
                  </span>
                  <input 
                    type="text" 
                    id="matrix-input-field"
                    value={matrixParams}
                    onChange={(e) => setMatrixParams(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-accent/30 text-ink py-3.5 px-4 font-mono text-sm outline-none focus:border-accent focus:bg-white/[0.04] transition-all rounded-xl"
                  />
                </div>

                {/* Primary generate button */}
                <button 
                  id="generate-render-button"
                  onClick={handleGenerateRender}
                  disabled={isGenerating || balance < 5}
                  className="bg-accent text-bg w-full py-4.5 px-6 rounded-xl flex justify-between items-center font-display font-extrabold text-[0.88rem] tracking-[0.05em] border-none cursor-pointer transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed glow-accent"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {isGenerating ? TRANSLATIONS[lang].processing : TRANSLATIONS[lang].generateRender}
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.1em] text-bg bg-black/10 px-2 py-0.5 rounded-md font-bold">[ 5.00 CR ]</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: UNIFIED TEAM CHAT (The interactive Design Council room) */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col overflow-hidden relative"
            >
              {/* Inteligent AI Training Animation Overlay */}
              <AnimatePresence>
                {isTrainingActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-accent text-bg font-mono font-bold text-[9px] uppercase tracking-[0.12em] px-4 py-2 border border-accent/20 flex items-center gap-2 shadow-2xl"
                  >
                    <span className="w-1.5 h-1.5 rounded-none bg-bg animate-ping" />
                    <span>{lang === 'ru' ? 'ИИ ИЗУЧАЕТ ТЗ И РЕФЕРЕНСЫ...' : 'AI ASSIMILATING SPECS & REFS...'}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Council Header Area */}
              <div id="chat-header" className="px-5 py-4 border-b border-ink-faint bg-surface shrink-0 z-10">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">● {lang === 'ru' ? 'НЕЙРО-КОНСИЛИУМ' : 'NEURAL COUNCIL'}</span>
                      <h2 className="font-display text-lg uppercase tracking-tight font-extrabold text-ink mt-0.5">
                        {lang === 'ru' ? 'Дизайнерский Совет' : 'Design Board'}
                      </h2>
                    </div>
                    {subChatTab === 'general' && (
                      <div className="flex items-center gap-1 bg-accent-soft border border-accent/20 px-2 py-0.5 rounded-none font-mono text-[8px] text-accent uppercase font-bold">
                        <span>{TRANSLATIONS[lang].fee}: 1.00 CR</span>
                      </div>
                    )}
                  </div>

                  {/* Two Sub-Tabs Toggle Switch */}
                  <div className="grid grid-cols-2 gap-1.5 bg-bg p-1.5 border border-ink-faint">
                    <button
                      onClick={() => { triggerHaptic('selection'); setSubChatTab('general'); }}
                      className={`py-3.5 text-xs font-mono uppercase tracking-wider cursor-pointer transition-all text-center flex items-center justify-center gap-2 ${
                        subChatTab === 'general'
                          ? 'bg-accent text-bg font-bold'
                          : 'text-ink-medium hover:text-ink hover:bg-ink/5'
                      }`}
                    >
                      <span className="text-sm">💬</span>
                      <span>{lang === 'ru' ? 'Общий Чат' : 'General Chat'}</span>
                    </button>
                    <button
                      onClick={() => { triggerHaptic('selection'); setSubChatTab('specs'); }}
                      className={`py-3.5 text-xs font-mono uppercase tracking-wider cursor-pointer transition-all text-center flex items-center justify-center gap-2 relative ${
                        subChatTab === 'specs'
                          ? 'bg-accent text-bg font-bold'
                          : 'text-ink-medium hover:text-ink hover:bg-ink/5'
                      }`}
                    >
                      <span className="text-sm">📚</span>
                      <span>{lang === 'ru' ? 'ТЗ и Обучение' : 'Specs & Training'}</span>
                      {specsList.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-bg font-sans font-extrabold text-[9px] px-2 py-0.5 border border-bg">
                          {specsList.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Group Avatar Grid (Only displayed on General Chat) */}
                  {subChatTab === 'general' && (
                    <div className="grid grid-cols-4 gap-2 px-1">
                      {AI_AGENTS.map(agent => (
                        <div 
                          key={agent.id}
                          onClick={() => { triggerHaptic('selection'); setChatTarget(agent.id); }}
                          className={`border p-3 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                            chatTarget === agent.id 
                              ? 'border-accent bg-accent-soft shadow-[inset_0_0_8px_rgba(255,118,87,0.15)]' 
                              : 'border-ink-faint hover:bg-ink/5'
                          } rounded-xl`}
                        >
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-ink-faint">
                            <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-bg" />
                          </div>
                          <span className="font-display font-bold text-[10.5px] text-ink mt-2 block truncate w-full">
                            {agent.name.split(' ')[0]}
                          </span>
                          <span className="font-mono text-[7.5px] text-ink-medium uppercase tracking-wider mt-0.5 truncate w-full">
                            {lang === 'ru' ? (agent.roleRu || agent.role).split(' ')[0] : agent.role.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Routing Target Selector (Only displayed on General Chat) */}
                  {subChatTab === 'general' && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-b border-ink-faint/30">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-medium shrink-0 font-bold">
                        {lang === 'ru' ? 'Кому:' : 'To:'}
                      </span>
                      <button
                        onClick={() => { triggerHaptic('selection'); setChatTarget('all'); }}
                        className={`px-4 py-2 text-[10px] font-mono tracking-wider border rounded-full cursor-pointer uppercase transition-all shrink-0 ${
                          chatTarget === 'all'
                            ? 'bg-accent text-bg border-accent font-bold shadow-sm'
                            : 'border-ink-faint text-ink hover:bg-ink/5'
                        }`}
                      >
                        {lang === 'ru' ? 'Все ИИ' : 'All Agents'}
                      </button>
                      {AI_AGENTS.map(agent => (
                        <button
                          key={agent.id}
                          onClick={() => { triggerHaptic('selection'); setChatTarget(agent.id); }}
                          className={`px-4 py-2 text-[10px] font-mono tracking-wider border rounded-full cursor-pointer uppercase transition-all shrink-0 ${
                            chatTarget === agent.id
                              ? 'bg-accent text-bg border-accent font-bold shadow-sm'
                              : 'border-ink-faint text-ink hover:bg-ink/5'
                          }`}
                        >
                          {agent.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Message Stream OR Specs database */}
              {subChatTab === 'general' ? (
                <div id="chat-message-stream" className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar pb-6 bg-bg">
                  {unifiedChat.map((msg) => {
                    const isUser = msg.sender === 'user';
                    const agentObj = !isUser ? AI_AGENTS.find(a => a.id === msg.sender) : null;
                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {!isUser && agentObj && (
                            <div className="w-4 h-4 rounded-none border border-ink-faint overflow-hidden">
                              <img src={agentObj.avatar} alt={msg.senderName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <span className="font-mono text-[7px] text-ink-medium uppercase tracking-widest px-0.5">
                            {isUser ? (lang === 'ru' ? 'КЛИЕНТ' : 'CLIENT') : msg.senderName?.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className={`p-3.5 rounded-none text-[11.5px] leading-relaxed font-sans border ${
                          isUser 
                            ? 'bg-accent text-bg border-accent shadow-sm' 
                            : 'bg-surface text-ink border-ink-faint'
                        }`}>
                          {msg.image && (
                            <div className="mb-2 max-w-full overflow-hidden border border-ink-faint">
                              <img src={msg.image} alt="Attachment" className="w-full max-h-48 object-cover rounded-none" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="whitespace-pre-line">{msg.text}</div>
                        </div>

                        <span className="font-mono text-[6.5px] text-ink-medium mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isAgentTyping && (
                    <div className="flex flex-col items-start max-w-[80%] mr-auto">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[7px] text-ink-medium uppercase tracking-widest px-0.5">
                          {typingAgent ? typingAgent.toUpperCase() : (lang === 'ru' ? 'ИИ АГЕНТ' : 'AI AGENT')}
                        </span>
                      </div>
                      <div className="bg-surface border border-ink-faint px-4.5 py-3 rounded-none flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-accent/65 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-accent/65 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-accent/65 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              ) : (
                <div id="specs-feed" className="flex-1 overflow-y-auto px-5 py-5 space-y-4 custom-scrollbar pb-6 bg-bg">
                  {/* Tutorial Explainer Box */}
                  <div className="border border-accent/20 bg-accent-soft p-4 rounded-none">
                    <span className="font-mono text-[8px] text-accent uppercase tracking-widest block mb-1">
                      ● {lang === 'ru' ? 'БАЗА ЗНАНИЙ И ОБУЧЕНИЕ ИИ' : 'KNOWLEDGE BASE & AI TRAINING'}
                    </span>
                    <p className="text-[11px] text-ink leading-relaxed font-sans">
                      {lang === 'ru' 
                        ? 'Загрузите сюда текстовые требования (ТЗ) или референсы-изображения. Агенты не переписываются в этой вкладке напрямую, а мгновенно усваивают эти материалы как рамки проектирования и будут ссылаться на них при генерации рендеров и в диалогах в Общем Чате.' 
                        : 'Upload design parameters (Specs) or reference images here. AI agents do not chat in this tab directly, but instantly absorb these constraints and apply them across both visualizer rendering and workspace dialogues.'}
                    </p>
                  </div>

                  {/* Specs List Cards */}
                  {specsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-ink-faint rounded-none">
                      <Layers className="w-8 h-8 text-ink-medium/30 mb-2 animate-pulse" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-medium">
                        {lang === 'ru' ? 'Список ТЗ и референсов пуст' : 'No training context uploaded'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {specsList.map((spec) => (
                        <div 
                          key={spec.id}
                          className="border border-ink-faint bg-surface p-3.5 rounded-none relative flex flex-col gap-3 group hover:border-accent/45 transition-all"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <span className="font-mono text-[7px] text-accent uppercase tracking-wider block mb-1.5">
                                ● {lang === 'ru' ? 'УСВОЕНО ИИ' : 'ABSORBED BY NEURAL WORKSPACE'}
                              </span>
                              <p className="text-[11.5px] text-ink leading-relaxed font-sans whitespace-pre-line">
                                {spec.text}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                triggerHaptic('light');
                                setSpecsList(prev => prev.filter(s => s.id !== spec.id));
                              }}
                              className="text-ink-medium hover:text-accent p-1 rounded-none hover:bg-ink/5 transition-all cursor-pointer shrink-0"
                              title={lang === 'ru' ? 'Удалить из обучения' : 'Remove from memory'}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {spec.image && (
                            <div className="w-full max-h-48 overflow-hidden border border-ink-faint relative rounded-none">
                              <img src={spec.image} alt="Reference Spec" className="w-full h-full object-cover rounded-none" referrerPolicy="no-referrer" />
                              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-none font-mono text-[7px] text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                                {lang === 'ru' ? 'ВИЗУАЛЬНЫЙ РЕФЕРЕНС' : 'VISUAL REFERENCE'}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center border-t border-ink-faint/45 pt-2 mt-1">
                            <span className="font-mono text-[7px] text-ink-medium tracking-wider uppercase">
                              {spec.timestamp}
                            </span>
                            <span className="font-mono text-[7px] text-emerald-400 uppercase tracking-[0.05em] flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                              {lang === 'ru' ? 'КОНТЕКСТ АКТИВЕН' : 'CONTEXT ACTIVE'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chat Input and Upload Panel */}
              <div id="chat-input-panel" className="bg-surface border-t border-ink-faint py-3 px-5 z-10 shrink-0">
                {/* File Upload Input */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Attachment Preview */}
                {selectedImage && (
                  <div className="mb-3 flex items-center gap-2 p-1.5 bg-bg border border-ink-faint rounded-none w-fit">
                    <div className="w-12 h-12 border border-ink-faint relative overflow-hidden shrink-0">
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-none" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[8px] text-ink uppercase tracking-wider">{lang === 'ru' ? 'Изображение готово' : 'Image Selected'}</span>
                      <button 
                        onClick={() => { triggerHaptic('light'); setSelectedImage(null); }}
                        className="font-mono text-[7px] text-accent hover:underline uppercase text-left tracking-wider cursor-pointer mt-0.5"
                      >
                        {lang === 'ru' ? 'Удалить' : 'Remove'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-bg border border-ink-faint rounded-none p-3.5">
                  <button 
                    id="chat-attach-btn"
                    onClick={handleImageUploadClick}
                    disabled={(isAgentTyping && subChatTab !== 'specs') || isUploading}
                    className="p-3 text-ink-medium hover:text-accent rounded-none cursor-pointer transition-colors disabled:opacity-20 flex items-center justify-center min-w-[48px] min-h-[48px] bg-white/[0.02] border border-white/5 active:scale-95"
                    title={lang === 'ru' ? 'Прикрепить картинку / референс' : 'Attach image / reference'}
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-accent" />
                    )}
                  </button>

                  <input 
                    type="text"
                    id="chat-input-text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      subChatTab === 'specs'
                        ? (lang === 'ru' ? 'Добавить ТЗ или референс...' : 'Add brief spec or reference details...')
                        : chatTarget === 'all' 
                          ? (lang === 'ru' ? 'Задать вопрос всему совету...' : 'Ask the entire board...') 
                          : (lang === 'ru' ? `Написать ${AI_AGENTS.find(a => a.id === chatTarget)?.name.split(' ')[0]}...` : `Message ${AI_AGENTS.find(a => a.id === chatTarget)?.name.split(' ')[0]}...`)
                    }
                    disabled={isAgentTyping && subChatTab !== 'specs'}
                    className="flex-1 bg-transparent border-none text-sm text-ink py-3 px-4 outline-none placeholder:text-ink-medium/35 disabled:opacity-50"
                  />
                  <button 
                    id="chat-send-btn"
                    onClick={handleSendMessage}
                    disabled={(isAgentTyping && subChatTab !== 'specs') || (!messageInput.trim() && !selectedImage)}
                    className="bg-accent text-bg p-3.5 rounded-none border-none cursor-pointer hover:opacity-90 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center min-w-[48px] min-h-[48px]"
                  >
                    {subChatTab === 'specs' ? <PlusCircle className="w-5 h-5" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: GALLERY (Showcase grid page) */}
          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar pb-24"
            >
              <div className="mb-6">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">● {TRANSLATIONS[lang].showcaseShowroom}</span>
                <h2 className="font-display text-[2rem] leading-[1.0] uppercase mt-2 tracking-[-0.04em] font-extrabold">
                  {TRANSLATIONS[lang].portfolio}
                </h2>
                <p className="text-[11px] text-ink-medium mt-1 leading-relaxed font-sans">
                  {TRANSLATIONS[lang].portfolioSub}
                </p>
              </div>

              {/* Gallery Grid */}
              <div id="gallery-grid" className="grid grid-cols-2 gap-3">
                {PROJECTS.map(proj => {
                  const savedImg = projectImages[proj.id] || proj.image;
                  return (
                    <div 
                      key={proj.id}
                      id={`gallery-card-${proj.id}`}
                      onClick={() => { triggerHaptic('selection'); setSelectedGalleryProject(proj); }}
                      className="glass-panel border border-white/[0.04] rounded-2xl overflow-hidden cursor-pointer group active:scale-[0.98] transition-all"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-white/5 relative">
                        <img 
                          src={savedImg} 
                          alt={proj.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded font-mono text-[7px] text-accent tracking-wider">
                          {proj.method}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-display font-extrabold text-[11px] tracking-wide text-ink uppercase truncate mb-0.5">
                          {lang === 'ru' ? (proj.nameRu || proj.name) : proj.name}
                        </h4>
                        <p className="font-mono text-[7px] text-ink-medium tracking-wide uppercase truncate">
                          {lang === 'ru' ? (proj.locationRu || proj.location) : proj.location}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explaining dynamic rendering capabilities */}
              <div className="mt-6 glass-panel border border-white/[0.04] p-4.5 rounded-2xl flex items-center gap-4">
                <Layers className="w-5 h-5 text-accent flex-shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-xs mb-0.5 text-ink uppercase">{TRANSLATIONS[lang].customRendersAvailable}</h4>
                  <p className="text-[11px] text-ink-medium leading-relaxed font-sans">
                    {TRANSLATIONS[lang].customRendersSub}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Floating expanded Gallery Item Modal Overlay */}
      <AnimatePresence>
        {selectedGalleryProject && (
          <motion.div 
            id="gallery-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col justify-end p-6"
          >
            <div className="relative flex flex-col max-h-[85%] bg-[#131217] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-300">
              {/* Close Button */}
              <button 
                id="close-gallery-modal"
                onClick={() => { triggerHaptic('light'); setSelectedGalleryProject(null); }}
                className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-ink p-2 rounded-full border border-white/5 cursor-pointer hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full aspect-[4/3] relative">
                <img 
                  src={projectImages[selectedGalleryProject.id] || selectedGalleryProject.image} 
                  alt={selectedGalleryProject.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-4 left-4 bg-accent/80 backdrop-blur-sm px-2.5 py-1 rounded font-mono text-[8px] text-bg font-extrabold tracking-widest uppercase">
                  {lang === 'ru' ? 'РЕНДЕР_АКТИВЕН' : 'ACTIVE_RENDER'}
                </div>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">
                    ● {lang === 'ru' ? (selectedGalleryProject.locationRu || selectedGalleryProject.location) : selectedGalleryProject.location}
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-ink uppercase mt-1 leading-tight">
                    {lang === 'ru' ? (selectedGalleryProject.nameRu || selectedGalleryProject.name) : selectedGalleryProject.name}
                  </h3>
                </div>

                <p className="text-xs text-ink-medium leading-relaxed font-sans">
                  {lang === 'ru' ? (selectedGalleryProject.descriptionRu || selectedGalleryProject.description) : selectedGalleryProject.description}
                </p>

                <div className="border-t border-white/[0.05] pt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-xl">
                    <span className="font-mono text-[8px] text-ink-medium uppercase block tracking-wider mb-1">
                      {lang === 'ru' ? 'Влияние шума' : 'Denoising Bias'}
                    </span>
                    <span className="font-mono text-[10px] text-accent font-medium">{(selectedGalleryProject.bias / 100).toFixed(2)}</span>
                  </div>
                  <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-xl">
                    <span className="font-mono text-[8px] text-ink-medium uppercase block tracking-wider mb-1">
                      {lang === 'ru' ? 'Алгоритм' : 'Matrix Algorithm'}
                    </span>
                    <span className="font-mono text-[10px] text-accent font-medium">{selectedGalleryProject.method}</span>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
                  <span className="font-mono text-[8px] text-ink-medium uppercase block tracking-wider mb-1">
                    {lang === 'ru' ? 'Параметры стиля' : 'Style Variables'}
                  </span>
                  <span className="font-mono text-[10.5px] text-ink font-medium select-all">{projectImages[selectedGalleryProject.id] ? '--regenerated-high-res ' : ''}{selectedGalleryProject.params}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Fullscreen Zoom & Pan Modal */}
      <AnimatePresence>
        {isZoomModalOpen && (
          <motion.div 
            id="zoom-pan-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col justify-between p-5"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center z-10 shrink-0 border-b border-white/[0.04] pb-3 pt-2">
              <div>
                <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-accent">● {TRANSLATIONS[lang].interactiveWorkspace}</span>
                <h3 className="font-display font-extrabold text-base text-ink uppercase leading-tight mt-0.5">
                  {lang === 'ru' ? (currentProject.nameRu || currentProject.name) : currentProject.name}
                </h3>
                <p className="font-mono text-[8px] text-ink-medium uppercase tracking-wide mt-0.5">
                  {TRANSLATIONS[lang].scale.replace('{scale}', zoomScale.toFixed(2))}
                </p>
              </div>

              <button 
                id="close-zoom-modal"
                onClick={() => { triggerHaptic('light'); setIsZoomModalOpen(false); }}
                className="bg-white/5 text-ink p-2 rounded-full border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Canvas/Workspace Container */}
            <div 
              id="zoom-interactive-stage"
              className="flex-1 w-full overflow-hidden relative rounded-2xl border border-white/[0.03] bg-[#0c0b0f] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            >
              {/* Target Grid overlay representing raw structure scanning */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,118,87,0.03)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="absolute top-4 left-4 w-4 h-4 border border-white/10 border-r-0 border-b-0 pointer-events-none" />
              <div className="absolute top-4 right-4 w-4 h-4 border border-white/10 border-l-0 border-b-0 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border border-white/10 border-r-0 border-t-0 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border border-white/10 border-l-0 border-t-0 pointer-events-none" />

              {/* The high-fidelity rendering inside zoom-pan transformer */}
              <div 
                className="transition-transform duration-75 ease-out select-none pointer-events-none"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                }}
              >
                <img 
                  src={displayedProjectImage} 
                  alt="Post-processed Architectural Result" 
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] filter contrast-[1.02] brightness-[0.98] saturate-[0.85]"
                  draggable={false}
                />
              </div>

              {/* Hint badge explaining wheel support */}
              <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5 pointer-events-none">
                <span className="font-mono text-[7px] text-ink-medium uppercase tracking-wider">{TRANSLATIONS[lang].wheelHint}</span>
              </div>
            </div>

            {/* Futuristic Controller Deck */}
            <div className="flex flex-col gap-3 pt-4 shrink-0 z-10">
              {/* Zoom Scale slider controller */}
              <div className="flex items-center justify-between gap-4 bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-medium shrink-0">{TRANSLATIONS[lang].fineScale}</span>
                <input 
                  type="range" 
                  min="1" max="5" 
                  step="0.05"
                  value={zoomScale} 
                  onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                  className="flex-1 h-[2px] bg-white/[0.06] rounded-full appearance-none outline-none accent-accent cursor-pointer"
                />
                <span className="font-mono text-[10px] text-accent w-10 text-right">{zoomScale.toFixed(2)}x</span>
              </div>

              {/* Action row with + / - / Reset / Toggle post-process comparison */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 1}
                  className="bg-white/5 hover:bg-white/10 text-ink py-3.5 rounded-xl border border-white/[0.05] font-mono text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-accent" />
                  <span className="text-[7.5px] uppercase tracking-wider text-ink-medium font-medium font-mono">{TRANSLATIONS[lang].out}</span>
                </button>

                <button
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 5}
                  className="bg-white/5 hover:bg-white/10 text-ink py-3.5 rounded-xl border border-white/[0.05] font-mono text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-accent" />
                  <span className="text-[7.5px] uppercase tracking-wider text-ink-medium font-medium font-mono">{TRANSLATIONS[lang].zoomIn}</span>
                </button>

                <button
                  onClick={handleResetZoom}
                  className="bg-white/5 hover:bg-white/10 text-ink py-3.5 rounded-xl border border-white/[0.05] font-mono text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Reset Position"
                >
                  <RefreshCw className="w-4 h-4 text-accent animate-spin-slow" />
                  <span className="text-[7.5px] uppercase tracking-wider text-ink-medium font-medium font-mono">{TRANSLATIONS[lang].reset}</span>
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    const isCustomImg = !!projectImages[currentProject.id];
                    if (isCustomImg) {
                      const currentImg = projectImages[currentProject.id];
                      setProjectImages(prev => ({
                        ...prev,
                        [currentProject.id]: currentImg === currentProject.image ? currentImg : currentProject.image
                      }));
                    } else {
                      triggerHaptic('heavy');
                    }
                  }}
                  className={`py-3.5 rounded-xl border font-mono text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                    projectImages[currentProject.id] 
                      ? 'bg-accent-soft hover:bg-accent/20 border-accent/20 text-accent' 
                      : 'bg-white/[0.02] border-white/[0.02] text-ink-medium cursor-not-allowed opacity-40'
                  }`}
                  title={projectImages[currentProject.id] ? "Compare original draft vs post-processed" : "Generate custom render first"}
                >
                  <Layers className={`w-4 h-4 ${projectImages[currentProject.id] ? 'text-accent animate-pulse' : 'text-ink-medium/30'}`} />
                  <span className="text-[7.5px] uppercase tracking-wider font-medium text-ink-medium font-mono">{TRANSLATIONS[lang].compare}</span>
                </button>
              </div>

              {/* Status info line */}
              <div className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1 rounded-md border border-white/[0.02]">
                <span className="font-mono text-[7px] text-ink-medium uppercase tracking-wider">{TRANSLATIONS[lang].projectUrl}: {currentProject.id}</span>
                <span className="font-mono text-[7px] text-accent uppercase tracking-wider">
                  {projectImages[currentProject.id] ? TRANSLATIONS[lang].statusPostProcessed : TRANSLATIONS[lang].statusDraft}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Dynamic bottom navigation bar - sitting statically and flat at the very bottom of the screen */}
      <nav id="atelier-navigation-bar" className="w-full h-[51px] bg-surface border-t border-ink-faint flex items-center px-4 justify-between z-10 shrink-0 select-none">
        <button 
          id="nav-tab-studio"
          onClick={() => { triggerHaptic('selection'); setActiveTab('studio'); }}
          className={`flex-1 h-full flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer ${
            activeTab === 'studio' 
              ? 'bg-ink/[0.03] text-accent border-t-2 border-accent' 
              : 'text-ink-medium hover:text-ink'
          }`}
        >
          <Compass className="w-3.5 h-3.5 mb-0.5 text-accent" />
          <span className="font-mono text-[7px] uppercase tracking-[0.1em] font-medium">{TRANSLATIONS[lang].studio}</span>
        </button>

        <button 
          id="nav-tab-chat"
          onClick={() => { triggerHaptic('selection'); setActiveTab('chat'); }}
          className={`flex-1 h-full flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer relative ${
            activeTab === 'chat' 
              ? 'bg-ink/[0.03] text-accent border-t-2 border-accent' 
              : 'text-ink-medium hover:text-ink'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 mb-0.5 text-accent" />
          <span className="font-mono text-[7px] uppercase tracking-[0.1em] font-medium">{TRANSLATIONS[lang].aiAgents}</span>
          {/* Subtle pulse notification badge */}
          <span className="absolute top-1.5 right-[35%] w-1.5 h-1.5 bg-accent rounded-none animate-ping pointer-events-none" />
        </button>

        <button 
          id="nav-tab-gallery"
          onClick={() => { triggerHaptic('selection'); setActiveTab('gallery'); }}
          className={`flex-1 h-full flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer ${
            activeTab === 'gallery' 
              ? 'bg-ink/[0.03] text-accent border-t-2 border-accent' 
              : 'text-ink-medium hover:text-ink'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 mb-0.5 text-accent" />
          <span className="font-mono text-[7px] uppercase tracking-[0.1em] font-medium">{TRANSLATIONS[lang].gallery}</span>
        </button>
      </nav>

      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            id="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-6"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              id="settings-panel"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-surface border border-ink-faint rounded-none p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-ink-faint pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-accent animate-spin-slow" />
                  <h3 className="font-display font-bold text-base uppercase text-ink">
                    {TRANSLATIONS[lang].settings}
                  </h3>
                </div>
                <button
                  onClick={() => { triggerHaptic('light'); setIsSettingsOpen(false); }}
                  className="p-1 text-ink-medium hover:text-ink hover:bg-ink/5 rounded-none transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Settings Core Form */}
              <div className="space-y-5">
                {/* Language Selection Section */}
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-ink-medium mb-2">
                    {TRANSLATIONS[lang].language}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { triggerHaptic('medium'); setLang('ru'); }}
                      className={`py-3 rounded-none border font-mono text-xs cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        lang === 'ru'
                          ? 'bg-accent-soft border-accent/40 text-accent font-medium'
                          : 'bg-bg border-ink-faint text-ink-medium hover:bg-ink/5 hover:text-ink'
                      }`}
                    >
                      <span className="text-sm">🇷🇺</span>
                      <span>Русский</span>
                    </button>
                    <button
                      onClick={() => { triggerHaptic('medium'); setLang('en'); }}
                      className={`py-3 rounded-none border font-mono text-xs cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        lang === 'en'
                          ? 'bg-accent-soft border-accent/40 text-accent font-medium'
                          : 'bg-bg border-ink-faint text-ink-medium hover:bg-ink/5 hover:text-ink'
                      }`}
                    >
                      <span className="text-sm">🇬🇧</span>
                      <span>English</span>
                    </button>
                  </div>
                </div>

                {/* Theme Selection Section (iOS style) */}
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-ink-medium mb-2">
                    {lang === 'ru' ? 'Тема оформления' : 'Theme'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { triggerHaptic('medium'); setTheme('dark'); }}
                      className={`py-3 rounded-none border font-mono text-xs cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        theme === 'dark'
                          ? 'bg-accent-soft border-accent/40 text-accent font-medium'
                          : 'bg-bg border-ink-faint text-ink-medium hover:bg-ink/5 hover:text-ink'
                      }`}
                    >
                      <span className="text-sm">🌙</span>
                      <span>{lang === 'ru' ? 'Темная' : 'Dark'}</span>
                    </button>
                    <button
                      onClick={() => { triggerHaptic('medium'); setTheme('light'); }}
                      className={`py-3 rounded-none border font-mono text-xs cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        theme === 'light'
                          ? 'bg-accent-soft border-accent/40 text-accent font-medium'
                          : 'bg-bg border-ink-faint text-ink-medium hover:bg-ink/5 hover:text-ink'
                      }`}
                    >
                      <span className="text-sm">☀️</span>
                      <span>{lang === 'ru' ? 'Светлая' : 'Light'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-bg border border-ink-faint p-3 rounded-none">
                  <p className="font-mono text-[8px] text-ink-medium leading-relaxed uppercase tracking-wide">
                    ● {TRANSLATIONS[lang].agentsLangHint}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => { triggerHaptic('light'); setIsSettingsOpen(false); }}
                className="w-full mt-6 bg-accent text-bg font-display font-bold text-xs py-3 rounded-none cursor-pointer hover:opacity-90 active:scale-95 transition-all text-center uppercase tracking-wider"
              >
                {TRANSLATIONS[lang].close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
