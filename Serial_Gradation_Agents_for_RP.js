//@name serial_gradation_agents_for_rp
//@display-name Serial Gradation Agents for RP
//@api 3.0
//@version 0.12.1
//@arg mode string off|lite|normal|full
//@arg turn_window int Recent chat turn-pair window used by the pipeline
//@arg max_recent_chars int Maximum recent-chat characters sent to each stage
//@arg max_previous_stage_chars int Maximum previous-stage JSON characters sent to the next stage
//@arg max_injection_chars int Maximum final draft characters injected into the main request
//@arg gradation_mode string full_draft — every beforeRequest agent rewrites a usable RP response draft (legacy analysis_scaffold removed in v0.7.0)
//@arg output_mode string draft_guided|risu_engine — draft_guided is 기본 모드, risu_engine is 확장 모드
//@arg built_in_style_preset string unified_stylepack
//@arg injection_position string first_system|last_system|before_last_user
//@arg failure_mode string soft|degraded|hard
//@arg stage_timeout_ms int Fallback per-stage LLM timeout in milliseconds
//@arg model_presets_json string JSON object of saved model presets
//@arg provider_presets_json string LIBRA/RE-compatible alias for model_presets_json
//@arg provider_presets_risuai_enabled string Reserved LIBRA-compatible flag: true|false
//@arg default_preset string Default model preset name
//@arg shadow_act_preset string Model preset for SHADOW ACT
//@arg character_aide_preset string Model preset for Character AIDE
//@arg world_aide_preset string Model preset for World AIDE
//@arg plot_aide_preset string Model preset for Plot AIDE
//@arg llm_provider string Fallback main LLM provider
//@arg llm_url string Fallback main LLM URL
//@arg llm_key string Fallback main LLM API key / Vertex bearer token / JSON placeholder
//@arg llm_model string Fallback main LLM model
//@arg llm_temp string Fallback main LLM temperature
//@arg llm_timeout int Fallback main LLM timeout ms
//@arg llm_timeout_ms int RE-compatible fallback timeout alias
//@arg llm_max_completion_tokens int Fallback main LLM max completion tokens
//@arg llm_request_format string Fallback request format: chat_completions|responses
//@arg llm_reasoning_preset string Fallback reasoning preset: auto|off|gpt|openrouter|gemini|gemini_budget|claude|claude_budget|deepseek|kimi|glm|ollama|custom
//@arg llm_reasoning_effort string Fallback reasoning effort: none|low|medium|high
//@arg llm_reasoning_budget_tokens int Fallback reasoning budget tokens (-1 enables dynamic Gemini budget)
//@arg llm_thinking_type string Fallback thinking toggle: enabled|disabled
//@arg llm_glm_thinking_type string Backward-compatible GLM thinking type alias
//@arg llm_glm_thinking string Fallback GLM thinking alias
//@arg llm_service_tier string Fallback service tier: off|auto|default|flex|priority|scale
//@arg custom_service_tier_passthrough string LIBRA-compatible custom provider service_tier passthrough: true|false
//@arg vertex_flex_mode string LIBRA-compatible Vertex Flex mode: off|provisioned_then_flex|flex_only
//@arg llm_stream string Fallback stream flag: true|false
//@arg enable_shadow_act string true|false
//@arg enable_character_aide string true|false
//@arg enable_world_aide string true|false
//@arg enable_plot_aide string true|false
//@arg shadow_prompt_extra string Extra SHADOW ACT instruction
//@arg character_prompt_extra string Extra Character AIDE instruction
//@arg world_prompt_extra string Extra World AIDE instruction
//@arg plot_prompt_extra string Extra Plot AIDE instruction
//@arg shadow_prompt_mode string builtin|replace — legacy replace means direction guidance enabled, not prompt replacement
//@arg character_prompt_mode string builtin|replace — legacy replace means direction guidance enabled, not prompt replacement
//@arg world_prompt_mode string builtin|replace — legacy replace means direction guidance enabled, not prompt replacement
//@arg plot_prompt_mode string builtin|replace — legacy replace means direction guidance enabled, not prompt replacement
//@arg shadow_prompt_custom string SHADOW ACT creative direction guidance; built-in structure is always preserved
//@arg character_prompt_custom string Character AIDE creative direction guidance; built-in structure is always preserved
//@arg world_prompt_custom string World AIDE creative direction guidance; built-in structure is always preserved
//@arg plot_prompt_custom string Plot AIDE creative direction guidance; built-in structure is always preserved
//@arg after_process_mode string off|audit|rewrite
//@arg after_max_response_chars int Maximum assistant response characters sent to custom afterRequest editors
//@arg llm_extra_body_json string Fallback extra JSON body merged into provider requests
//@arg debug_log string true|false
//@arg shadow_include_risu_context string true|false — let SHADOW ACT read RisuAI character/persona/lore context
//@arg shadow_risu_context_max_chars int Maximum RisuAI character/persona/lore context characters sent only to SHADOW ACT
//@arg backend_hosting_mode string Hosting bridge mode: off|auto|hosted
//@arg backend_hosting_url string LIBRA hosting bridge backend URL
//@arg backend_hosting_token string LIBRA hosting bridge backend token
//@arg enable_gui string true|false

/*
 * Serial Gradation Agents for RP v0.12.0
 *
 * A RisuAI API v3 plugin that turns the old RE Companion V2 current-turn
 * Shadow Act/AIDE staging idea into the Serial Gradation Agents for RP
 * drafting and post-response editing pipeline.
 *
 * v0.2.0 adds model preset routing and afterRequest post-processing.
 * v0.3.0 expands the provider layer to a full LIBRA-style provider core:
 * - OpenAI-compatible providers, Anthropic, Gemini, Vertex Gemini, Vertex OpenAI,
 *   Ollama native /api/chat, Ollama Cloud, NanoGPT, LM Studio, Copilot, Custom.
 * - Vertex service-account JSON / access_token / direct Bearer token support.
 * - Provider-specific URL normalization and streaming aggregation.
 *
 * v0.12.0 transplants the LIBRA 6.1.1-dev direct provider layer:
 * - 27 registered direct OpenAI-compatible API providers.
 * - Chat Completions / Responses request-format routing.
 * - LIBRA 6.1 reasoning presets and output-budget ceiling semantics.
 * - Provider-specific endpoint, header, and reasoning-payload normalization.
 *
 * v0.4.0 adds an in-plugin settings GUI for presets, stage routing,
 * beforeRequest agents, afterRequest checks, direction guidance prompts,
 * and runtime debug.
 *
 * v0.4.1 aligns the GUI entry point with RisuAI plugins.md API v3 UI rules:
 * - registers a Settings menu item / optional button when available
 * - opens the iframe through Risuai.showContainer('fullscreen')
 * - hides it through Risuai.hideContainer() from the Close action
 *
 * v0.4.2 separates provider preset management from agent routing in the GUI
 * and localizes the built-in settings panel into Korean.
 *
 * v0.5.0 separates the persisted data model as well as the visible tabs:
 * - provider presets, agent slots, post-processors, prompts, and runtime settings
 *   use independent storage records
 * - provider secrets are stored in device-local plugin storage when available
 * - v0.4.x settings are migrated automatically
 * - the Korean dashboard gains overview, provider, agent, post-check, prompt,
 *   runtime, and debug pages
 *
 * v0.6.2 stabilizes the v0.6 true-gradation path:
 * - settings GUI no longer clears the whole plugin iframe body
 * - migration retry state is reset after pluginStorage failures
 * - full_draft stages may accept plain draft text when strict JSON is missing
 * - provider configuration diagnostics are surfaced in skip traces
 *
 * v0.7.0 drops the legacy analysis_scaffold gradation mode and the scaffold
 * output mode. The pipeline is now exclusively the serial full_draft flow:
 * SHADOW ACT writes the first RP response draft, then Character AIDE, World
 * AIDE, and Plot AIDE each analyze the recent chat for their domain and
 * rewrite the previous draft in sequence before it is injected into the
 * response model. afterRequest can run custom post-response editors.
 *
 * v0.8.0 rebuilds the settings GUI around two top-level pages: execution flow
 * and providers. Stage routing, prompts, context limits, RisuAI references,
 * per-stage timeout/mode, runtime/injection, and JSON transfer are edited in
 * one vertical flow. Provider reasoning, Vertex credentials, and Flex service
 * controls are separated into provider-aware panels.
 *
 * v0.8.1 fixes prompt-mode editing inside the execution-flow cards: the
 * prompt-mode dropdown now mutates the persisted GUI state object directly
 * instead of a normalized copy, so selecting direction guidance immediately
 * opens and retains the direction guidance editor.
 *
 * v0.8.8 treats user-entered prompt text as creative direction guidance only.
 * Built-in stage roles, same-turn rewrite boundaries, output contracts, and
 * RisuAI reference rules always remain active for beforeRequest agents and
 * afterRequest editing.
 *
 * v0.8.9 hardens draft extraction for low-tier/local model output. If a model
 * writes the real draft in response_draft but leaves draft.rp_text as a header
 * stub, the parser now keeps the complete draft and rejects header-only success.
 *
 * v0.9.0 adds user-defined analysis-only agents that can be inserted between
 * writing agents. They do not rewrite the draft; their analysis is accumulated
 * into the ledger and handed to the next writing agent.
 *
 * v0.10.0 adds a RisuAI-like self response engine mode. It mimics RisuAI's
 * promptTemplate item flow and V3 lorebook activation pass over accessible
 * character/chat/module lore, then generates the final response inside the
 * plugin before afterRequest returns it.
 *
 * v0.10.1 aligns compatibility fallbacks with RisuAI API v3 guidance:
 * provider secrets no longer fall back to synced pluginStorage, and network
 * calls require RisuAI nativeFetch/risuFetch instead of silent browser fetch.
 *
 * v0.10.2 hardens partial JSON and low-tier/local model recovery:
 * hidden <Thoughts>/analysis blocks are not accepted as drafts, partial JSON
 * prefers draft.rp_text over analysis-like response_draft, and mid-sentence
 * cutoffs fall back or retry instead of being marked as clean success.
 *
 * v0.11.0 replaces fixed afterRequest post-check stages with user-defined
 * custom post-response editors. These agents revise and expand the RisuAI
 * returned response only when doing so preserves or improves its quality.
 *
 * v0.11.1 removes the execution-flow quick-jump anchor buttons because RisuAI
 * can block them in the plugin iframe.
 *
 * v0.11.2 folds built-in writing presets into one neutral unified stylepack
 * and removes named style headers from draft prompts.
 *
 * v0.11.3 removes the direct SGA-final-draft replacement output mode; legacy
 * stored replace values now fall back to draft_guided.
 *
 * v0.11.4 names draft_guided as 기본 모드 and risu_engine as 확장 모드.
 * risu_engine is now an engine-draft injection mode: the
 * RisuAI-like pass creates a stronger final candidate, then the main response
 * model receives that candidate instead of being bypassed.
 *
 * v0.11.5 strips hidden assistant reasoning blocks from recent chat history
 * before building draft, lore/RAG, and extension-mode prompt contexts. It also
 * preserves longer stage drafts internally and uses middle truncation for
 * unavoidable prompt/debug previews so draft endings remain visible.
 *
 * v0.11.6 stops auto-generating serial response wrapper headers by default
 * and strips leading # 응답/volume/chapter/Chatindex/timestamp frames from
 * stage drafts unless the actual prose starts after them.
 *
 * v0.11.7 stops truncating the visible stage draft result and "actual values"
 * JSON panels, so GUI inspection shows the same full draft stored in trace data.
 *
 * v0.11.8 narrows timestamp-wrapper stripping guidance so prose datelines like
 * "밤 10:20 PM, ..." are preserved as scene text instead of being treated as
 * decorative response headers.
 *
 * v0.11.9 adds LIBRA Hosting Bridge support: the plugin can auto-detect the
 * local bridge bootstrap endpoint, store backend URL/token, and route provider
 * calls through the bridge fetch endpoint.
 *
 * v0.11.10 raises the balanced default generation envelope for real RP drafts:
 * 90s stage timeout, 8192 provider max-token ceiling, and 1200-5000 character
 * target draft length. Per-stage token requests are still dynamically sized
 * from the target draft length instead of always spending the full ceiling.
 *
 * v0.11.13 aligns current-turn input resolution with HAYAKU 2.0's published
 * precedence rules. Supported wrappers and provenance-bearing user messages
 * are compared without guessing unknown prompt preset structures; the resolved
 * input is then shared unchanged across the entire serial pipeline. It also
 * makes optional after-response editing opt-in for new configurations and
 * keeps all visible per-agent timeout guidance synchronized with the 90000ms
 * default. Serial execution and the hosting bridge are otherwise unchanged.
 *
 * This plugin deliberately does NOT maintain its own long-term memory DB.
 */

(async () => {
  'use strict';

  const API = (() => {
    try { if (typeof Risuai !== 'undefined' && Risuai) return Risuai; } catch (_) {}
    try { if (typeof risuai !== 'undefined' && risuai) return risuai; } catch (_) {}
    try { if (typeof globalThis !== 'undefined') return globalThis.Risuai || globalThis.risuai || null; } catch (_) {}
    return null;
  })();

  if (!API) {
    console.warn('[SGA-RP] RisuAI API is unavailable. Plugin host not initialized.');
    return;
  }

  const PLUGIN_NAME = 'serial_gradation_agents_for_rp';
  const PLUGIN_VERSION = '0.12.1';
  const INJECTION_HEADER = '[SERIAL GRADATION AGENTS FOR RP]';
  const STAGE_SCHEMA = 'serial_gradation_agents_for_rp_stage_v1';
  const FULL_DRAFT_STAGE_SCHEMA = 'serial_gradation_agents_for_rp_full_draft_stage_v1';
  const POST_SCHEMA = 'serial_gradation_agents_for_rp_post_v1';
  const LEGACY_STORAGE_PRESETS_KEY = 'serial_gradation_agents_for_rp:model_presets:v1';
  const LEGACY_STORAGE_SETTINGS_KEY = 'serial_gradation_agents_for_rp:settings:v1';
  const STORAGE_PROVIDER_PRESETS_KEY = 'serial_gradation_agents_for_rp:provider_presets:v2';
  const STORAGE_AGENT_SLOTS_KEY = 'serial_gradation_agents_for_rp:agent_slots:v2';
  const STORAGE_POST_PROCESSORS_KEY = 'serial_gradation_agents_for_rp:post_processors:v2';
  const STORAGE_PROMPT_OVERRIDES_KEY = 'serial_gradation_agents_for_rp:prompt_overrides:v2';
  const STORAGE_RUNTIME_SETTINGS_KEY = 'serial_gradation_agents_for_rp:runtime_settings:v2';
  const STORAGE_MIGRATION_KEY = 'serial_gradation_agents_for_rp:migration:v2';
  const LOCAL_PROVIDER_SECRETS_KEY = 'serial_gradation_agents_for_rp:provider_secrets:v1';
  const SETTINGS_UI_ID = 'serial-gradation-agents-for-rp-settings';
  const DEFAULT_STAGE_TIMEOUT_MS = 90000;
  const DEFAULT_STAGE_CONTEXT_CHARS = 10000;
  const DEFAULT_MAX_STAGE_TOKENS = 8192;
  const DEFAULT_RECENT_TURNS = 12;
  const DEFAULT_MAX_RECENT_CHARS = 18000;
  const DEFAULT_MAX_PREVIOUS_STAGE_CHARS = 9000;
  const DEFAULT_MAX_INJECTION_CHARS = 9000;
  const DEFAULT_AFTER_RESPONSE_CHARS = 18000;
  const DEFAULT_SHADOW_RISU_CONTEXT_CHARS = 12000;
  const DEFAULT_SHADOW_ACTIVE_LORE_LIMIT = 16;
  const DEFAULT_TARGET_DRAFT_MIN_CHARS = 1200;
  const DEFAULT_TARGET_DRAFT_MAX_CHARS = 5000;
  const RISU_ENGINE_STAGE = 'risu_response_engine';
  const OUTPUT_MODES = Object.freeze(['draft_guided', 'risu_engine']);
  const CUSTOM_ANALYSIS_STAGE_PREFIX = 'custom_analysis_';
  const CUSTOM_POST_STAGE_PREFIX = 'custom_post_';
  const EXPORT_KIND = 'serial-gradation-agents-for-rp.configuration';
  const FLOW_EXPORT_KIND = 'serial-gradation-agents-for-rp.execution-flow';
  const EXPORT_VERSION = 3;
  const FLOW_EXPORT_VERSION = 1;
  const LIBRA_HOSTING_BRIDGE_LOCAL_BOOTSTRAP_URL = 'http://127.0.0.1:18787/__libra_host__/bootstrap';

  const BEFORE_STAGE_DEFS = Object.freeze([
    Object.freeze({ id: 'shadow_act', label: 'SHADOW ACT', description: '최근 대화와 최신 입력으로 현재 턴의 첫 RP 초안을 만듭니다.' }),
    Object.freeze({ id: 'aide_character', label: '인물 AIDE', description: '인물 정의·심리·관계·비밀·시점·지식 경계를 분석해 초안을 수정합니다.' }),
    Object.freeze({ id: 'aide_world', label: '세계관 AIDE', description: '장소·시간·사회적 맥락·물리 제약·세계 규칙과 연속성을 점검해 초안을 수정합니다.' }),
    Object.freeze({ id: 'aide_plot', label: '플롯 AIDE', description: '현재 플롯·긴장·속도·복선·다음 턴 개방성을 반영해 최종 응답 초안을 만듭니다.' })
  ]);
  const LEGACY_POST_STAGE_DEFS = Object.freeze([
    Object.freeze({ id: 'post_character_check', label: '인물 검사', description: '완성 응답의 인물성·말투·심리·비밀·POV·유저 주도권을 검사합니다.' }),
    Object.freeze({ id: 'post_world_check', label: '세계관 검사', description: '완성 응답의 장소·시간·물리 연속성·설정 규칙·장면 허용 범위를 검사합니다.' }),
    Object.freeze({ id: 'post_plot_check', label: '플롯 검사', description: '완성 응답의 속도·긴장·강제 결말·성급한 폭로·다음 턴 여지를 검사합니다.' }),
    Object.freeze({ id: 'post_korean_check', label: '한글 맞춤법 검사', description: '의미와 캐릭터 보이스를 유지하며 맞춤법·띄어쓰기·문법·문장 흐름을 다듬습니다.' })
  ]);
  const POST_STAGE_DEFS = Object.freeze([]);
  const CUSTOM_ANALYSIS_INSERT_POINTS = Object.freeze([
    Object.freeze({ value: 'shadow_act', label: 'SHADOW ACT 뒤 / 인물 AIDE 전' }),
    Object.freeze({ value: 'aide_character', label: '인물 AIDE 뒤 / 세계관 AIDE 전' }),
    Object.freeze({ value: 'aide_world', label: '세계관 AIDE 뒤 / 플롯 AIDE 전' })
  ]);
  const CUSTOM_ANALYSIS_INSERT_VALUES = Object.freeze(CUSTOM_ANALYSIS_INSERT_POINTS.map(item => item.value));
  const ALL_STAGE_DEFS = Object.freeze([...BEFORE_STAGE_DEFS, ...POST_STAGE_DEFS]);
  const STAGE_DEF_MAP = Object.freeze(Object.fromEntries(ALL_STAGE_DEFS.map(def => [def.id, def])));

  const isPostStageId = (stageId) => String(stageId || '').startsWith('post_') || String(stageId || '').startsWith(CUSTOM_POST_STAGE_PREFIX);
  const defaultExecutionModeForStage = (stageId) => stageId === 'shadow_act' || isPostStageId(stageId) ? 'draft_only' : 'analysis_draft';
  const defaultRisuReferencesForStage = (stageId) => stageId === 'shadow_act'
    ? { persona: true, characterDescription: true, characterLorebook: true, moduleLorebook: true }
    : { persona: false, characterDescription: false, characterLorebook: false, moduleLorebook: false };
  const normalizeRisuReferences = (value = {}, fallback = {}) => ({
    persona: asBool(value?.persona ?? value?.include_persona, fallback.persona === true),
    characterDescription: asBool(value?.characterDescription ?? value?.character_description ?? value?.include_character_description, fallback.characterDescription === true),
    characterLorebook: asBool(value?.characterLorebook ?? value?.character_lorebook ?? value?.include_character_lorebook, fallback.characterLorebook === true),
    moduleLorebook: asBool(value?.moduleLorebook ?? value?.module_lorebook ?? value?.include_module_lorebook, fallback.moduleLorebook === true)
  });

  const normalizeCustomAnalysisInsertAfter = (value) => {
    const raw = text(value || '').trim();
    return CUSTOM_ANALYSIS_INSERT_VALUES.includes(raw) ? raw : 'shadow_act';
  };

  const customAnalysisStageId = (value, index = 0) => {
    const raw = compact(value || '', 80).replace(/[^a-zA-Z0-9_-]/g, '_');
    return raw && raw.startsWith(CUSTOM_ANALYSIS_STAGE_PREFIX)
      ? raw
      : `${CUSTOM_ANALYSIS_STAGE_PREFIX}${raw || String(index + 1)}`;
  };

  const normalizeCustomAnalysisAgentRecord = (value = {}, index = 0) => {
    const id = customAnalysisStageId(value?.id || value?.stage || value?.stage_id, index);
    return {
      id,
      enabled: asBool(value?.enabled, true),
      label: compact(value?.label || value?.name || `분석 에이전트 ${index + 1}`, 80),
      insert_after: normalizeCustomAnalysisInsertAfter(value?.insert_after ?? value?.insertAfter ?? value?.afterStage),
      preset: compact(value?.preset ?? value?.presetName ?? '', 120),
      max_chars: clampInt(value?.max_chars ?? value?.maxChars, 1000, 100000, DEFAULT_STAGE_CONTEXT_CHARS),
      turn_window: clampInt(value?.turn_window ?? value?.turnWindow, 1, 64, DEFAULT_RECENT_TURNS),
      timeout_ms: clampInt(value?.timeout_ms ?? value?.timeoutMs, 5000, 300000, DEFAULT_STAGE_TIMEOUT_MS),
      prompt: text(value?.prompt ?? value?.analysis_prompt ?? value?.analysisPrompt ?? ''),
      risu_refs: normalizeRisuReferences(value?.risu_refs ?? value?.risuRefs, { persona: false, characterDescription: false, characterLorebook: false, moduleLorebook: false })
    };
  };

  const normalizeCustomAnalysisAgents = (value = []) => {
    const source = Array.isArray(value) ? value : (Array.isArray(value?.agents) ? value.agents : []);
    const seen = new Set();
    return source.map((item, index) => {
      const record = normalizeCustomAnalysisAgentRecord(item, index);
      let id = record.id;
      let suffix = 2;
      while (seen.has(id)) {
        id = `${record.id}_${suffix}`;
        suffix += 1;
      }
      seen.add(id);
      return { ...record, id };
    });
  };

  const customAnalysisDef = (agent, index = 0) => Object.freeze({
    id: agent.id,
    label: agent.label || `분석 에이전트 ${index + 1}`,
    description: '사용자 프롬프트에 따라 분석만 수행하고 결과를 다음 작성 에이전트에 전달합니다.',
    customAnalysis: true
  });

  const customPostStageId = (value, index = 0) => {
    const raw = compact(value || '', 80).replace(/[^a-zA-Z0-9_-]/g, '_');
    return raw && raw.startsWith(CUSTOM_POST_STAGE_PREFIX)
      ? raw
      : `${CUSTOM_POST_STAGE_PREFIX}${raw || String(index + 1)}`;
  };

  const normalizeCustomPostAgentRecord = (value = {}, index = 0) => {
    const id = customPostStageId(value?.id || value?.stage || value?.stage_id, index);
    return {
      id,
      enabled: asBool(value?.enabled, true),
      label: compact(value?.label || value?.name || `후속 편집 에이전트 ${index + 1}`, 80),
      preset: compact(value?.preset ?? value?.presetName ?? '', 120),
      max_chars: clampInt(value?.max_chars ?? value?.maxChars, 1000, 100000, DEFAULT_STAGE_CONTEXT_CHARS),
      turn_window: clampInt(value?.turn_window ?? value?.turnWindow, 1, 64, DEFAULT_RECENT_TURNS),
      timeout_ms: clampInt(value?.timeout_ms ?? value?.timeoutMs, 5000, 300000, DEFAULT_STAGE_TIMEOUT_MS),
      prompt: text(value?.prompt ?? value?.edit_prompt ?? value?.editPrompt ?? '')
    };
  };

  const normalizeCustomPostAgents = (value = []) => {
    const source = Array.isArray(value) ? value : (Array.isArray(value?.agents) ? value.agents : []);
    const seen = new Set();
    return source.map((item, index) => {
      const record = normalizeCustomPostAgentRecord(item, index);
      let id = record.id;
      let suffix = 2;
      while (seen.has(id)) {
        id = `${record.id}_${suffix}`;
        suffix += 1;
      }
      seen.add(id);
      return { ...record, id };
    });
  };

  const customPostDef = (agent, index = 0) => Object.freeze({
    id: agent.id,
    label: agent.label || `후속 편집 에이전트 ${index + 1}`,
    description: 'RisuAI가 반환한 응답을 같은 턴 안에서 더 자연스럽고 밀도 높은 최종 응답으로 수정·확장합니다.',
    customPost: true
  });

  const PROVIDERS = Object.freeze([
    'openai', 'claude', 'anthropic', 'gemini', 'google', 'google_ai',
    'openrouter', 'deepseek', 'lmstudio', 'lm_studio', 'ollama', 'ollama_cloud',
    'nanogpt', 'vertex', 'vertex-gemini', 'vertex_gemini',
    'vertex-openai', 'vertex_openai', 'copilot', 'github_copilot', 'custom'
  ]);

  const PROVIDER_ALIASES = Object.freeze({
    anthropic: 'claude',
    google: 'gemini',
    google_ai: 'gemini',
    lm_studio: 'lmstudio',
    'vertex-gemini': 'vertex',
    vertex_gemini: 'vertex',
    vertex_openai: 'vertex-openai',
    github_copilot: 'copilot'
  });

  const PROVIDER_PRESETS = Object.freeze({
    openai: {
      label: 'OpenAI',
      url: 'https://api.openai.com/v1/chat/completions',
      baseUrl: 'https://api.openai.com',
      mode: 'openai_compat',
      auth: 'bearer',
      endpoint: '/v1/chat/completions'
    },
    claude: {
      label: 'Claude / Anthropic',
      url: 'https://api.anthropic.com/v1/messages',
      baseUrl: 'https://api.anthropic.com',
      mode: 'anthropic',
      auth: 'x-api-key',
      endpoint: '/v1/messages'
    },
    anthropic: {
      label: 'Claude / Anthropic',
      url: 'https://api.anthropic.com/v1/messages',
      baseUrl: 'https://api.anthropic.com',
      mode: 'anthropic',
      auth: 'x-api-key',
      endpoint: '/v1/messages'
    },
    gemini: {
      label: 'Gemini API',
      url: 'https://generativelanguage.googleapis.com/v1beta',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      mode: 'gemini',
      auth: 'x-goog-api-key'
    },
    google: {
      label: 'Gemini API',
      url: 'https://generativelanguage.googleapis.com/v1beta',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      mode: 'gemini',
      auth: 'x-goog-api-key'
    },
    google_ai: {
      label: 'Gemini API',
      url: 'https://generativelanguage.googleapis.com/v1beta',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      mode: 'gemini',
      auth: 'x-goog-api-key'
    },
    openrouter: {
      label: 'OpenRouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      baseUrl: 'https://openrouter.ai/api',
      mode: 'openai_compat',
      auth: 'bearer',
      endpoint: '/v1/chat/completions'
    },
    deepseek: {
      label: 'DeepSeek',
      url: 'https://api.deepseek.com/chat/completions',
      baseUrl: 'https://api.deepseek.com',
      mode: 'openai_compat',
      auth: 'bearer',
      endpoint: '/chat/completions'
    },
    lmstudio: {
      label: 'LM Studio',
      url: 'http://localhost:1234/v1/chat/completions',
      baseUrl: 'http://localhost:1234/v1',
      mode: 'openai_compat',
      auth: 'none',
      endpoint: '/v1/chat/completions',
      local: true
    },
    lm_studio: {
      label: 'LM Studio',
      url: 'http://localhost:1234/v1/chat/completions',
      baseUrl: 'http://localhost:1234/v1',
      mode: 'openai_compat',
      auth: 'none',
      endpoint: '/v1/chat/completions',
      local: true
    },
    ollama: {
      label: 'Ollama local',
      url: 'http://localhost:11434',
      baseUrl: 'http://localhost:11434',
      mode: 'ollama_native',
      auth: 'optional_bearer',
      endpoint: '/api/chat',
      local: true
    },
    ollama_cloud: {
      label: 'Ollama Cloud',
      url: 'https://ollama.com/v1/chat/completions',
      baseUrl: 'https://ollama.com',
      mode: 'openai_compat',
      auth: 'bearer',
      endpoint: '/v1/chat/completions'
    },
    nanogpt: {
      label: 'NanoGPT',
      url: 'https://nano-gpt.com/api/v1/chat/completions',
      baseUrl: 'https://nano-gpt.com/api',
      mode: 'openai_compat',
      auth: 'bearer',
      endpoint: '/v1/chat/completions'
    },
    vertex: {
      label: 'Vertex Gemini',
      url: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/publishers/google/models',
      baseUrl: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/publishers/google/models',
      mode: 'vertex_gemini',
      auth: 'vertex_service_account_or_bearer'
    },
    'vertex-gemini': {
      label: 'Vertex Gemini',
      url: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/publishers/google/models',
      baseUrl: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/publishers/google/models',
      mode: 'vertex_gemini',
      auth: 'vertex_service_account_or_bearer'
    },
    vertex_gemini: {
      label: 'Vertex Gemini',
      url: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/publishers/google/models',
      baseUrl: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/publishers/google/models',
      mode: 'vertex_gemini',
      auth: 'vertex_service_account_or_bearer'
    },
    'vertex-openai': {
      label: 'Vertex OpenAI-compatible',
      url: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/endpoints/openapi/chat/completions',
      baseUrl: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/endpoints/openapi',
      mode: 'vertex_openai',
      auth: 'vertex_service_account_or_bearer'
    },
    vertex_openai: {
      label: 'Vertex OpenAI-compatible',
      url: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/endpoints/openapi/chat/completions',
      baseUrl: 'https://aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/endpoints/openapi',
      mode: 'vertex_openai',
      auth: 'vertex_service_account_or_bearer'
    },
    copilot: {
      label: 'GitHub Copilot',
      url: 'https://api.githubcopilot.com/chat/completions',
      baseUrl: 'https://api.githubcopilot.com',
      mode: 'openai_compat',
      auth: 'copilot',
      endpoint: '/chat/completions'
    },
    github_copilot: {
      label: 'GitHub Copilot',
      url: 'https://api.githubcopilot.com/chat/completions',
      baseUrl: 'https://api.githubcopilot.com',
      mode: 'openai_compat',
      auth: 'copilot',
      endpoint: '/chat/completions'
    },
    custom: {
      label: 'Custom OpenAI-compatible',
      url: '',
      baseUrl: '',
      mode: 'openai_compat',
      auth: 'bearer',
      endpoint: '/v1/chat/completions'
    }
  });

  // LIBRA 6.1.1-dev direct LLM provider catalog. These entries use the
  // existing Serial Gradation Agents fetch/hosting path; the hosting bridge
  // itself is intentionally left untouched.
  const normalizeDirectProviderKey = (provider = '') => {
    const raw = String(provider || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
    const aliases = {
      anthropic: 'claude',
      google: 'gemini',
      'google-ai': 'gemini',
      'lm-studio': 'lmstudio',
      'ollama-cloud': 'ollama_cloud',
      'vertex-gemini': 'vertex',
      'vertex-openai': 'vertex-openai',
      'github-copilot': 'copilot',
      'cloudflare-ai': 'cloudflare-ai-gateway',
      cloudflare: 'cloudflare-ai-gateway',
      crof: 'crofai',
      'fireworks-ai': 'fireworks',
      'lightning-ai-studio': 'lightning-ai',
      llmgateway: 'llm-gateway',
      'neural-watt': 'neuralwatt',
      'novita-ai': 'novita',
      'novita-coding-plan': 'novita-coding',
      opencode: 'opencode-go',
      'silicon-flow': 'siliconflow',
      'synthetic-new': 'synthetic',
      venice: 'venice-ai',
      'vercel-ai-gateway': 'vercel-ai',
      vercel: 'vercel-ai',
      zai: 'z-ai',
      'zai-coding': 'z-ai-coding',
      mimo: 'xiaomi-mimo',
      'mimo-token-plan-cn': 'xiaomi-mimo-token-plan-cn',
      'mimo-token-plan-sgp': 'xiaomi-mimo-token-plan-sgp',
      'mimo-token-plan-ams': 'xiaomi-mimo-token-plan-ams'
    };
    return aliases[raw] || raw;
  };

  const DIRECT_LLM_PROVIDER_REGISTRY = Object.freeze({
    deepseek: Object.freeze({ label: 'DeepSeek', baseUrl: 'https://api.deepseek.com', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    together: Object.freeze({ label: 'Together AI', baseUrl: 'https://api.together.xyz/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    fireworks: Object.freeze({ label: 'Fireworks AI', baseUrl: 'https://api.fireworks.ai/inference/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '/responses' }),
    arliai: Object.freeze({ label: 'ArliAI', baseUrl: 'https://api.arliai.com/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    cerebras: Object.freeze({ label: 'Cerebras', baseUrl: 'https://api.cerebras.ai/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    'cloudflare-ai-gateway': Object.freeze({ label: 'Cloudflare AI Gateway', baseUrl: 'https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/ai/v1', chatPath: '/chat/completions', modelsPath: '', responsesPath: '/responses', requiresConfiguredUrl: true }),
    crofai: Object.freeze({ label: 'CrofAI', baseUrl: 'https://ai.nahcrof.com/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    digitalocean: Object.freeze({ label: 'DigitalOcean Gradient AI', baseUrl: 'https://inference.do-ai.run/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '/responses' }),
    featherless: Object.freeze({ label: 'Featherless AI', baseUrl: 'https://api.featherless.ai/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    'heroku-us': Object.freeze({ label: 'Heroku Managed Inference (US)', baseUrl: 'https://us.inference.heroku.com/v1', chatPath: '/chat/completions', modelsPath: '', responsesPath: '' }),
    'heroku-eu': Object.freeze({ label: 'Heroku Managed Inference (EU)', baseUrl: 'https://eu.inference.heroku.com/v1', chatPath: '/chat/completions', modelsPath: '', responsesPath: '' }),
    'lightning-ai': Object.freeze({ label: 'Lightning AI', baseUrl: 'https://lightning.ai/api/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    'llm-gateway': Object.freeze({ label: 'LLM Gateway', baseUrl: 'https://api.llmgateway.io/v1', chatPath: '/chat/completions', modelsPath: '/models?exclude_deprecated=true', responsesPath: '' }),
    neuralwatt: Object.freeze({ label: 'Neuralwatt', baseUrl: 'https://api.neuralwatt.com/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    novita: Object.freeze({ label: 'Novita AI', baseUrl: 'https://api.novita.ai/openai/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    'novita-coding': Object.freeze({ label: 'Novita Coding', baseUrl: 'https://api.novita.ai/openai/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    'opencode-go': Object.freeze({ label: 'OpenCode Go', baseUrl: 'https://opencode.ai/zen/go/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    siliconflow: Object.freeze({ label: 'SiliconFlow', baseUrl: 'https://api.siliconflow.com/v1', chatPath: '/chat/completions', modelsPath: '/models?sub_type=chat', responsesPath: '' }),
    synthetic: Object.freeze({ label: 'Synthetic', baseUrl: 'https://api.synthetic.new/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '' }),
    'venice-ai': Object.freeze({ label: 'Venice AI', baseUrl: 'https://api.venice.ai/api/v1', chatPath: '/chat/completions', modelsPath: '/models?type=text', responsesPath: '' }),
    'vercel-ai': Object.freeze({ label: 'Vercel AI Gateway', baseUrl: 'https://ai-gateway.vercel.sh/v1', chatPath: '/chat/completions', modelsPath: '/models', responsesPath: '/responses' }),
    'z-ai': Object.freeze({ label: 'Z.ai', baseUrl: 'https://api.z.ai/api/paas/v4', chatPath: '/chat/completions', modelsPath: '', responsesPath: '' }),
    'z-ai-coding': Object.freeze({ label: 'Z.ai Coding Plan', baseUrl: 'https://api.z.ai/api/coding/paas/v4', chatPath: '/chat/completions', modelsPath: '', responsesPath: '' }),
    'xiaomi-mimo': Object.freeze({ label: 'Xiaomi MiMo', baseUrl: 'https://api.xiaomimimo.com/v1', chatPath: '/chat/completions', modelsPath: '', responsesPath: '' }),
    'xiaomi-mimo-token-plan-cn': Object.freeze({ label: 'Xiaomi MiMo Token Plan (China)', baseUrl: 'https://token-plan-cn.xiaomimimo.com/v1', chatPath: '/chat/completions', modelsPath: '', responsesPath: '' }),
    'xiaomi-mimo-token-plan-sgp': Object.freeze({ label: 'Xiaomi MiMo Token Plan (Singapore)', baseUrl: 'https://token-plan-sgp.xiaomimimo.com/v1', chatPath: '/chat/completions', modelsPath: '', responsesPath: '' }),
    'xiaomi-mimo-token-plan-ams': Object.freeze({ label: 'Xiaomi MiMo Token Plan (Europe)', baseUrl: 'https://token-plan-ams.xiaomimimo.com/v1', chatPath: '/chat/completions', modelsPath: '', responsesPath: '' })
  });

  const directProviderDefinition = (provider = '') => DIRECT_LLM_PROVIDER_REGISTRY[normalizeDirectProviderKey(provider)] || null;
  const normalizeLLMRequestFormat = (value = '') => {
    const raw = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    return ['responses', 'response', 'openai_responses'].includes(raw) ? 'responses' : 'chat_completions';
  };
  const joinProviderEndpoint = (base = '', endpointPath = '') => {
    const rawBase = String(base || '').trim().replace(/\/+$/, '');
    const rawPath = String(endpointPath || '').trim();
    if (!rawBase || !rawPath) return rawBase;
    const [pathPart, queryPart = ''] = rawPath.split('?');
    const normalizedPath = `/${String(pathPart || '').replace(/^\/+/, '')}`;
    const currentEndpoint = rawBase.match(/\/(chat\/completions|responses|messages|embeddings|models)(?:\?.*)?$/i);
    const targetEndpoint = normalizedPath.match(/\/(chat\/completions|responses|messages|embeddings|models)$/i)?.[1] || '';
    if (currentEndpoint) {
      if (String(currentEndpoint[1]).toLowerCase() === String(targetEndpoint).toLowerCase()) return rawBase;
      return joinProviderEndpoint(rawBase.slice(0, currentEndpoint.index), rawPath);
    }
    const baseLower = rawBase.toLowerCase();
    const segments = normalizedPath.split('/').filter(Boolean);
    let overlap = '';
    for (let count = segments.length; count > 0; count -= 1) {
      const candidate = `/${segments.slice(0, count).join('/')}`;
      if (baseLower.endsWith(candidate.toLowerCase())) { overlap = candidate; break; }
    }
    const joined = `${rawBase}${overlap ? normalizedPath.slice(overlap.length) : normalizedPath}`;
    return queryPart ? `${joined}?${queryPart}` : joined;
  };
  const resolveDirectProviderEndpoint = (provider = '', rawUrl = '', kind = 'chat') => {
    const definition = directProviderDefinition(provider);
    if (!definition) return '';
    const endpointPath = kind === 'models' ? definition.modelsPath : kind === 'responses' ? definition.responsesPath : definition.chatPath;
    return endpointPath ? joinProviderEndpoint(String(rawUrl || '').trim() || definition.baseUrl, endpointPath) : '';
  };
  const validateDirectProviderUrl = (provider = '', url = '') => {
    const definition = directProviderDefinition(provider);
    const raw = String(url || definition?.baseUrl || '').trim();
    if (definition?.requiresConfiguredUrl && /(?:ACCOUNT_ID|GATEWAY_ID|\{[^}]+\})/i.test(raw)) {
      throw new Error(`${definition.label} URL의 계정 식별자를 실제 값으로 바꿔 주세요.`);
    }
    return raw;
  };
  const providerSupportsResponses = (provider = '') => {
    const p = normalizeDirectProviderKey(provider);
    const definition = directProviderDefinition(p);
    if (definition) return !!definition.responsesPath;
    return ['openai', 'openrouter', 'custom'].includes(p);
  };

  const PROVIDER_MODEL_CATALOG_BUILTINS = Object.freeze({
    openai: Object.freeze({ label: 'OpenAI', modelsPath: '/v1/models', modelsUrl: 'https://api.openai.com/v1/models' }),
    openrouter: Object.freeze({ label: 'OpenRouter', modelsPath: '/v1/models', modelsUrl: 'https://openrouter.ai/api/v1/models' }),
    gemini: Object.freeze({ label: 'Gemini AI Studio', modelsPath: '/v1beta/models', modelsUrl: 'https://generativelanguage.googleapis.com/v1beta/models' }),
    ollama_cloud: Object.freeze({ label: 'Ollama Cloud', modelsPath: '/v1/models', modelsUrl: 'https://ollama.com/v1/models' }),
    nanogpt: Object.freeze({ label: 'NanoGPT', modelsPath: '/v1/models', modelsUrl: 'https://nano-gpt.com/api/v1/models' })
  });
  const ProviderModelCache = new Map();
  const PROVIDER_MODEL_CACHE_TTL_MS = 5 * 60 * 1000;
  const providerModelMetadata = (provider = '', rawUrl = '') => {
    const p = canonicalProvider(provider);
    const direct = directProviderDefinition(p);
    if (direct) return {
      key: p, label: direct.label, baseUrl: direct.baseUrl,
      modelsUrl: resolveDirectProviderEndpoint(p, rawUrl, 'models'),
      requiresConfiguredUrl: direct.requiresConfiguredUrl === true
    };
    const builtin = PROVIDER_MODEL_CATALOG_BUILTINS[p];
    if (!builtin) return null;
    const raw = String(rawUrl || '').trim();
    return {
      key: p, label: builtin.label, baseUrl: defaultBaseForProvider(p),
      modelsUrl: raw ? joinProviderEndpoint(raw, builtin.modelsPath) : builtin.modelsUrl,
      requiresConfiguredUrl: false
    };
  };
  const normalizeProviderModels = (payload = {}, provider = '') => {
    const source = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.models) ? payload.models : Array.isArray(payload?.items) ? payload.items : [];
    const seen = new Set();
    return source.map(item => {
      const record = typeof item === 'string' ? { id: item } : (item || {});
      let id = String(record.id || record.model || record.slug || record.name || '').trim();
      if (canonicalProvider(provider) === 'gemini') id = id.replace(/^models\//, '');
      if (!id || seen.has(id)) return null;
      seen.add(id);
      return {
        id,
        label: String(record.display_name || record.displayName || record.label || record.name || id).trim().replace(/^models\//, '') || id,
        contextWindow: Number(record.context_length || record.context_window || record.contextWindow || 0) || 0,
        maxOutputTokens: Number(record.max_output_tokens || record.maxOutputTokens || record.max_completion_tokens || 0) || 0
      };
    }).filter(Boolean).sort((a, b) => a.id.localeCompare(b.id));
  };
  const listProviderModels = async (preset = {}, options = {}) => {
    const clean = sanitizePreset(preset || {});
    const meta = providerModelMetadata(clean.provider, clean.url);
    if (!meta?.modelsUrl) throw new Error(`${meta?.label || providerDisplayLabel(clean.provider)}는 자동 모델 목록을 제공하지 않습니다. 모델 ID를 직접 입력하세요.`);
    validateDirectProviderUrl(meta.key, clean.url || meta.baseUrl);
    if (!providerAllowsEmptyKey(meta.key) && !clean.key) throw new Error('모델 목록을 불러오려면 API 키가 필요합니다.');
    const cacheKey = `${meta.key}|${meta.modelsUrl}|${clean.key ? 'keyed' : 'anonymous'}`;
    const cached = ProviderModelCache.get(cacheKey);
    if (options.force !== true && cached && Date.now() - cached.at < PROVIDER_MODEL_CACHE_TTL_MS) return cached.models.map(item => ({ ...item }));
    const headers = { Accept: 'application/json' };
    if (clean.key && meta.key === 'gemini') headers['x-goog-api-key'] = stripBearerPrefix(clean.key);
    else if (clean.key) headers.Authorization = `Bearer ${stripBearerPrefix(clean.key)}`;
    applyOpenAIProviderHeaders(headers, meta.key);
    const response = await RisuCompat.nativeFetch(meta.modelsUrl, { method: 'GET', headers }, Math.max(5000, Number(clean.timeout_ms || 20000) || 20000));
    if (response?.ok === false) {
      const detail = await responseBodyToText(response).catch(() => '');
      throw new Error(`모델 목록 조회 실패: HTTP ${response?.status || 'Unknown'}${detail ? ` - ${detail.slice(0, 240)}` : ''}`);
    }
    const payload = await responseToJsonOrText(response);
    const models = normalizeProviderModels(payload || {}, meta.key);
    if (!models.length) throw new Error('프로바이더가 빈 모델 목록을 반환했습니다.');
    ProviderModelCache.set(cacheKey, { at: Date.now(), models });
    return models.map(item => ({ ...item }));
  };

  const REASONING_PRESETS = Object.freeze({
    auto: Object.freeze({ label: 'Auto detect', hint: '프로바이더와 모델 이름에서 계열을 자동 감지합니다.' }),
    off: Object.freeze({ label: 'Off / provider default', hint: '추론 전용 파라미터를 보내지 않습니다.' }),
    gpt: Object.freeze({ label: 'OpenAI reasoning', hint: 'Chat Completions reasoning_effort 또는 Responses reasoning.effort를 사용합니다.' }),
    openrouter: Object.freeze({ label: 'OpenRouter unified reasoning', hint: 'reasoning.enabled/effort/max_tokens를 사용합니다.' }),
    claude: Object.freeze({ label: 'Claude adaptive thinking', hint: 'thinking.type=adaptive와 output_config.effort를 사용합니다.' }),
    claude_budget: Object.freeze({ label: 'Claude manual budget', hint: 'thinking.type=enabled + budget_tokens를 사용합니다.' }),
    gemini: Object.freeze({ label: 'Gemini thinking level', hint: 'thinkingLevel을 사용합니다.' }),
    gemini_budget: Object.freeze({ label: 'Gemini thinking budget', hint: 'thinkingBudget을 사용합니다. -1은 dynamic입니다.' }),
    deepseek: Object.freeze({ label: 'DeepSeek Reasoner', hint: '모델 자체 추론을 사용하고 temperature를 제거합니다.' }),
    kimi: Object.freeze({ label: 'Kimi', hint: 'thinking.type을 사용합니다.' }),
    glm: Object.freeze({ label: 'GLM', hint: 'thinking.type=enabled/disabled를 사용합니다.' }),
    ollama: Object.freeze({ label: 'Ollama native thinking', hint: '/api/chat think 값을 사용합니다.' }),
    custom: Object.freeze({ label: 'Custom / no transform', hint: '추론 파라미터를 자동 변환하지 않습니다.' })
  });
  const REASONING_PRESET_KEYS = Object.freeze(Object.keys(REASONING_PRESETS));
  const normalizeReasoningPresetKey = (value = 'auto') => {
    const raw = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (!raw) return 'auto';
    if (raw === 'none' || raw === 'disabled') return 'off';
    if (raw === 'anthropic') return 'claude';
    if (raw === 'anthropic_budget') return 'claude_budget';
    if (raw === 'gemini_2_5' || raw === 'gemini25') return 'gemini_budget';
    return REASONING_PRESET_KEYS.includes(raw) ? raw : 'auto';
  };
  const getConfiguredThinkingType = (preset = {}) => String(preset?.thinking_type || preset?.thinkingType || preset?.glm_thinking_type || 'enabled').trim().toLowerCase() === 'disabled' ? 'disabled' : 'enabled';
  const effectiveReasoningFamilyForPreset = (preset = {}) => {
    const requested = normalizeReasoningPresetKey(preset.reasoning_preset || 'auto');
    if (requested !== 'auto') return requested;
    const provider = normalizeDirectProviderKey(preset.provider || 'custom');
    const model = String(preset.model || '').trim().toLowerCase();
    if (provider === 'openrouter') return 'openrouter';
    if (provider === 'claude' || /claude/.test(model)) return 'claude';
    if (['gemini', 'vertex'].includes(provider) || /gemini|gemma/.test(model)) return 'gemini';
    if (provider === 'deepseek' || /deepseek/.test(model)) return 'deepseek';
    if (/kimi|moonshot/.test(model)) return 'kimi';
    if (['z-ai', 'z-ai-coding'].includes(provider) || /(?:^|[\/_-])glm(?:[\d._-]|$)|zai/.test(model)) return 'glm';
    if (provider === 'ollama') return 'ollama';
    if (['openai', 'vertex-openai', 'copilot'].includes(provider) || /^(o\d|gpt-)/.test(model)) return 'gpt';
    return 'custom';
  };
  const resolveProviderOutputBudget = (preset = {}, options = {}, familyValue = '') => {
    const requested = clampInt(options?.maxTokens || preset?.max_tokens || DEFAULT_MAX_STAGE_TOKENS, 1, 200000, DEFAULT_MAX_STAGE_TOKENS);
    const configured = clampInt(preset?.max_tokens || requested, 1, 200000, requested);
    const providerMaxTokens = Math.max(1, Math.min(requested, configured));
    const family = normalizeReasoningPresetKey(familyValue || effectiveReasoningFamilyForPreset(preset));
    const configuredPreset = normalizeReasoningPresetKey(preset?.reasoning_preset || 'auto');
    const rawBudget = Math.floor(Number(preset?.reasoning_budget_tokens) || 0);
    const requestedReasoningBudget = rawBudget === -1 ? -1 : Math.max(0, rawBudget);
    const effort = String(preset?.reasoning_effort || 'none').trim().toLowerCase();
    // Backward-compatible auto mode only detects the payload family. It does not
    // silently enable hidden reasoning unless the user set an effort or budget.
    const defaultsToReasoning = configuredPreset !== 'auto' && ['deepseek','kimi','glm','claude','claude_budget','gemini','gemini_budget','ollama','openrouter'].includes(family);
    const explicitlyDisabled = options?.disableReasoning === true || options?.noReasoning === true || configuredPreset === 'off' || configuredPreset === 'custom';
    const toggleDisabled = getConfiguredThinkingType(preset) === 'disabled' && ['kimi','glm','claude','claude_budget','gemini','gemini_budget','ollama','openrouter'].includes(family);
    const reasoningRequested = requestedReasoningBudget !== 0 || (effort && effort !== 'none') || defaultsToReasoning;
    const reasoningAllowed = !explicitlyDisabled && !toggleDisabled && reasoningRequested;
    const minimumVisibleTokens = Math.min(providerMaxTokens, Math.max(128, Math.ceil(providerMaxTokens * 0.35)));
    const reasoningBudgetTokens = reasoningAllowed ? (requestedReasoningBudget === -1 ? -1 : Math.min(requestedReasoningBudget, Math.max(0, providerMaxTokens - minimumVisibleTokens))) : 0;
    const transformActive = !['auto','off','custom'].includes(configuredPreset) || reasoningAllowed;
    return Object.freeze({ requestedTokens: requested, configuredCap: configured, providerMaxTokens, requestedReasoningBudget, reasoningBudgetTokens, minimumVisibleTokens, reasoningAllowed, transformActive, configuredPreset, family });
  };


  const OLLAMA_CLOUD_SUGGESTED_MODELS = Object.freeze([
    'glm-5.2:cloud', 'glm-5.1:cloud', 'glm-5:cloud',
    'kimi-k2.5:cloud', 'kimi-k2.6:cloud', 'kimi-k2.7-code:cloud',
    'deepseek-v4-pro:cloud', 'deepseek-v3.2:cloud', 'deepseek-v4-flash:cloud',
    'gemini-3-flash-preview:cloud', 'gemma4:26b-a4b-it-q4_K_M', 'gemma4:31b-cloud'
  ]);

  const NANO_GPT_SUGGESTED_MODELS = Object.freeze([
    'zai-org/glm-5.2', 'zai-org/glm-5.1', 'zai-org/glm-5',
    'moonshotai/kimi-k2.5', 'moonshotai/kimi-k2.6', 'moonshotai/kimi-k2.7-code',
    'deepseek/deepseek-v4-pro', 'deepseek/deepseek-v3.2', 'deepseek/deepseek-v4-flash',
    'google/gemma-4-26b-a4b-it', 'google/gemma-4-31b-it'
  ]);

  const DEEPSEEK_SUGGESTED_MODELS = Object.freeze([
    'deepseek-chat', 'deepseek-reasoner'
  ]);

  const registered = { before: null, after: null, setting: null, button: null };
  const Runtime = {
    runs: 0,
    postRuns: 0,
    last: null,
    lastBeforeContext: null,
    lastPost: null,
    warnings: [],
    inFlight: false,
    postInFlight: false,
    settings: null,
    providerPresets: {},
    secretStorage: 'unknown',
    migratedFrom: null,
    migration: null,
    lastInjection: '',
    stageTrace: [],
    postTrace: [],
    lastProviderRequest: null,
    lastProviderResponse: null,
    lastProviderError: null,
    lastBackendBridge: null,
    lastSafeStage: null,
    lastRisuContext: null,
    risuEngine: null,
    finalDraft: '',
    finalDraftMeta: null,
    analysisLedger: {},
    hookStatus: { beforeRequest: false, afterRequest: false, unload: false, setting: false, button: false }
  };

  const log = (...args) => {
    if (Runtime.settings?.debugLog) console.log('[SGA-RP]', ...args);
  };

  const warn = (...args) => {
    const msg = args.map(x => (x && x.message) ? x.message : String(x)).join(' ');
    Runtime.warnings.push({ at: Date.now(), msg: msg.slice(0, 500) });
    if (Runtime.warnings.length > 60) Runtime.warnings.shift();
    if (Runtime.settings?.debugLog) console.warn('[SGA-RP]', ...args);
  };

  const text = (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  };

  const compact = (value, max = 1000) => {
    const body = text(value).replace(/\r\n/g, '\n').replace(/[\t ]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    if (!max || body.length <= max) return body;
    return body.slice(0, Math.max(0, max - 24)).trimEnd() + '\n…[truncated]';
  };

  const compactMiddle = (value, max = 1000, marker = '\n…[middle truncated for context]\n') => {
    const body = text(value).replace(/\r\n/g, '\n').trim();
    if (!max || body.length <= max) return body;
    const room = Math.max(0, max - marker.length);
    const head = Math.floor(room * 0.46);
    const tail = room - head;
    return `${body.slice(0, head).trimEnd()}${marker}${body.slice(Math.max(head, body.length - tail)).trimStart()}`;
  };

  const clampInt = (value, min, max, fallback) => {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  };

  const clampNumber = (value, min, max, fallback) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  };

  const normalizeChoice = (value, choices, fallback) => {
    const raw = text(value).trim().toLowerCase();
    return choices.includes(raw) ? raw : fallback;
  };

  const normalizeBuiltInStylePreset = (_value) => 'unified_stylepack';

  const asBool = (value, fallback = false) => {
    if (value == null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const raw = text(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on', 'enabled'].includes(raw)) return true;
    if (['false', '0', 'no', 'n', 'off', 'disabled'].includes(raw)) return false;
    return fallback;
  };

  const tryJsonParse = (raw, fallback = null) => {
    const value = text(raw).trim();
    if (!value) return fallback;
    try { return JSON.parse(value); } catch (_) { return fallback; }
  };

  const normalizeBackendHostingMode = (mode = 'off') => {
    const normalized = text(mode || 'off').trim().toLowerCase();
    return ['off', 'auto', 'hosted'].includes(normalized) ? normalized : 'off';
  };
  const normalizeBackendHostingUrl = (url = '') => text(url || '').trim().replace(/\/+$/, '');
  const normalizeBackendHostingConfig = (value = {}) => {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const lastManifestRaw = source.lastManifest ?? source.last_manifest ?? source.backend_hosting_last_manifest ?? null;
    const parsedManifest = typeof lastManifestRaw === 'string' ? tryJsonParse(lastManifestRaw, null) : lastManifestRaw;
    return {
      mode: normalizeBackendHostingMode(source.mode || source.backendHostingMode || source.backend_hosting_mode || 'off'),
      url: normalizeBackendHostingUrl(source.url || source.backendUrl || source.backend_hosting_url || ''),
      token: text(source.token || source.backendToken || source.backend_hosting_token || '').trim(),
      autoDetected: asBool(source.autoDetected ?? source.backendHostingAutoDetected ?? source.backend_hosting_auto_detected, false),
      lastDetectedAt: text(source.lastDetectedAt || source.backend_hosting_last_detected_at || '').trim(),
      lastManifest: parsedManifest && typeof parsedManifest === 'object' && !Array.isArray(parsedManifest) ? parsedManifest : null
    };
  };
  const headersToPlainObject = (headers = {}) => {
    try {
      if (typeof Headers !== 'undefined' && headers instanceof Headers) return Object.fromEntries(headers.entries());
    } catch (_) {}
    return Object.fromEntries(Object.entries(headers || {}).filter(([key, value]) => key && value !== undefined && value !== null));
  };
  const bytesToBase64 = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    if (typeof btoa === 'function') return btoa(binary);
    throw new Error('Base64 encoding is unavailable in this RisuAI runtime.');
  };
  const encodeBackendBridgeBody = (rawBody = null) => {
    if (rawBody == null) return { bodyEncoding: 'none', body: null };
    if (typeof rawBody === 'string') {
      const trimmed = rawBody.trim();
      if (!trimmed) return { bodyEncoding: 'text', body: rawBody };
      try { return { bodyEncoding: 'json', body: JSON.parse(trimmed) }; } catch (_) {
        return { bodyEncoding: 'text', body: rawBody };
      }
    }
    try {
      if (rawBody instanceof ArrayBuffer || ArrayBuffer.isView(rawBody)) {
        const bytes = rawBody instanceof ArrayBuffer ? new Uint8Array(rawBody) : new Uint8Array(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength);
        return { bodyEncoding: 'base64', body: bytesToBase64(bytes) };
      }
    } catch (_) {}
    if (typeof rawBody === 'object') return { bodyEncoding: 'json', body: rawBody };
    return { bodyEncoding: 'text', body: String(rawBody) };
  };
  const isBackendBridgeUrl = (url = '') => /\/__libra_host__\//i.test(text(url || ''));
  const backendBridgeEndpoint = (hosting = {}, stream = false) => `${normalizeBackendHostingUrl(hosting.url || '')}/__libra_host__/${stream ? 'stream' : 'fetch'}`;
  const activeBackendHosting = () => normalizeBackendHostingConfig(Runtime.settings?.backendHosting || Gui.state?.runtime?.backendHosting || {});
  const shouldRouteThroughBackendBridge = (url, requestInit = {}) => {
    const hosting = activeBackendHosting();
    return hosting.mode !== 'off'
      && !!hosting.url
      && !!hosting.token
      && requestInit.backendBridge !== false
      && !isBackendBridgeUrl(url);
  };

  const getArgument = async (name, fallback = '') => {
    const tryNames = [name, `${PLUGIN_NAME}::${name}`];
    for (const key of tryNames) {
      try {
        if (typeof API.getArgument === 'function') {
          const value = await API.getArgument(key);
          if (value !== undefined && value !== null && value !== '') return value;
        }
      } catch (_) {}
      try {
        if (typeof API.getArg === 'function') {
          const value = await API.getArg(key);
          if (value !== undefined && value !== null && value !== '') return value;
        }
      } catch (_) {}
    }
    return fallback;
  };

  const RisuCompat = (() => {
    let localStorePromise = null;
    const nativeFetch = async (url, init = {}, timeoutMs = 120000) => {
      let requestUrl = url;
      let requestInit = { ...init, requestTimeoutMs: timeoutMs };
      if (shouldRouteThroughBackendBridge(url, requestInit)) {
        const hosting = activeBackendHosting();
        const stream = (() => {
          try { return tryJsonParse(requestInit.body, {})?.stream === true; } catch (_) { return false; }
        })();
        const encoded = encodeBackendBridgeBody(requestInit.body);
        requestUrl = backendBridgeEndpoint(hosting, stream);
        requestInit = {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-libra-backend-token': hosting.token
          },
          body: JSON.stringify({
            targetUrl: url,
            method: text(requestInit.method || 'GET').toUpperCase(),
            headers: headersToPlainObject(requestInit.headers || {}),
            bodyEncoding: encoded.bodyEncoding,
            body: encoded.body,
            timeoutMs
          }),
          requestTimeoutMs: timeoutMs,
          backendBridge: false
        };
        Runtime.lastBackendBridge = {
          at: Date.now(),
          mode: hosting.mode,
          backendUrl: compact(hosting.url, 700),
          endpoint: stream ? 'stream' : 'fetch',
          targetOrigin: (() => { try { return new URL(text(url)).origin; } catch (_) { return compact(url, 180); } })(),
          autoDetected: hosting.autoDetected === true
        };
        if (Runtime.settings?.debugLog) log('backend_bridge_fetch', Runtime.lastBackendBridge);
      }
      if (isProbablyLocalNetworkUrl(requestUrl) && !requestInit.networkRoute) requestInit.networkRoute = 'local_network';
      let timer = null;
      let controller = null;
      try {
        if (typeof AbortController !== 'undefined' && !requestInit.signal) {
          controller = new AbortController();
          requestInit.signal = controller.signal;
          timer = setTimeout(() => controller.abort(), timeoutMs);
        }
        if (typeof API.nativeFetch === 'function') return await API.nativeFetch(requestUrl, requestInit);
        if (typeof API.risuFetch === 'function') return await API.risuFetch(requestUrl, requestInit);
        throw new Error('RisuAI nativeFetch/risuFetch API is unavailable; browser fetch fallback is disabled for API v3 storage/fetch compliance.');
      } finally {
        if (timer) clearTimeout(timer);
      }
    };
    const getItem = async (key) => {
      try {
        if (typeof API.pluginStorage?.getItem === 'function') return await API.pluginStorage.getItem(key);
      } catch (_) {}
      return null;
    };
    const setItem = async (key, value) => {
      try {
        if (typeof API.pluginStorage?.setItem === 'function') {
          await API.pluginStorage.setItem(key, value);
          return true;
        }
      } catch (_) {}
      return false;
    };
    const removeItem = async (key) => {
      try {
        if (typeof API.pluginStorage?.removeItem === 'function') {
          await API.pluginStorage.removeItem(key);
          return true;
        }
      } catch (_) {}
      return false;
    };
    const getLocalStore = async () => {
      if (!localStorePromise) {
        localStorePromise = (async () => {
          try {
            if (typeof API.getLocalPluginStorage === 'function') {
              const store = await API.getLocalPluginStorage();
              if (store?.getItem && store?.setItem) return { kind: 'localPluginStorage', store, structured: true };
            }
          } catch (_) {}
          try {
            if (API.safeLocalStorage?.getItem && API.safeLocalStorage?.setItem) {
              return { kind: 'safeLocalStorage', store: API.safeLocalStorage, structured: false };
            }
          } catch (_) {}
          return { kind: 'unavailable', store: null, structured: false };
        })();
      }
      return await localStorePromise;
    };
    const localGetItem = async (key) => {
      const holder = await getLocalStore();
      Runtime.secretStorage = holder.kind;
      if (!holder.store?.getItem) return null;
      try {
        const value = await holder.store.getItem(key);
        if (holder.structured || value == null || typeof value !== 'string') return value;
        return tryJsonParse(value, value);
      } catch (_) { return null; }
    };
    const localSetItem = async (key, value) => {
      const holder = await getLocalStore();
      Runtime.secretStorage = holder.kind;
      if (!holder.store?.setItem) return false;
      try {
        await holder.store.setItem(key, holder.structured ? value : JSON.stringify(value));
        return true;
      } catch (_) { return false; }
    };
    const localRemoveItem = async (key) => {
      const holder = await getLocalStore();
      Runtime.secretStorage = holder.kind;
      if (!holder.store?.removeItem) return false;
      try { await holder.store.removeItem(key); return true; } catch (_) { return false; }
    };
    return Object.freeze({ nativeFetch, getItem, setItem, removeItem, localGetItem, localSetItem, localRemoveItem, getLocalStore });
  })();

  function isProbablyLocalNetworkUrl(url) {
    try {
      const host = new URL(String(url || '')).hostname.toLowerCase();
      return host === 'localhost'
        || host === '127.0.0.1'
        || host === '0.0.0.0'
        || host === '::1'
        || host.endsWith('.local')
        || host.startsWith('192.168.')
        || host.startsWith('10.')
        || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
        || /^[a-z0-9_-]+$/i.test(host);
    } catch (_) { return false; }
  }

  const canonicalProvider = (value = 'custom') => {
    const raw = text(value || 'custom').trim().toLowerCase().replace(/[_\s]+/g, '-');
    const direct = normalizeDirectProviderKey(raw);
    if (DIRECT_LLM_PROVIDER_REGISTRY[direct]) return direct;
    const underscore = direct.replace(/-/g, '_');
    const picked = PROVIDER_PRESETS[direct] ? direct : PROVIDER_PRESETS[underscore] ? underscore : (PROVIDER_ALIASES[direct] || PROVIDER_ALIASES[underscore] || direct);
    return PROVIDER_PRESETS[picked] ? (PROVIDER_ALIASES[picked] || picked) : 'custom';
  };

  const providerDefinition = (provider = '') => PROVIDER_PRESETS[canonicalProvider(provider)] || directProviderDefinition(provider) || null;
  const providerDisplayLabel = (provider = '') => providerDefinition(provider)?.label || canonicalProvider(provider) || 'custom';

  const sanitizePreset = (raw = {}) => {
    const provider = canonicalProvider(raw.provider || raw.llm_provider || 'custom');
    const timeoutFallback = clampInt(raw.timeout_ms || raw.timeout || raw.llm_timeout_ms || raw.llm_timeout, 5000, 300000, DEFAULT_STAGE_TIMEOUT_MS);
    const thinkingType = raw.thinking_type ?? raw.thinkingType ?? raw.llm_thinking_type ?? raw.glm_thinking_type ?? raw.llm_glm_thinking_type ?? raw.glm_thinking ?? raw.llm_glm_thinking ?? '';
    const rawBudget = Number(raw.reasoning_budget_tokens ?? raw.llm_reasoning_budget_tokens ?? 0);
    const reasoningBudget = rawBudget === -1 ? -1 : clampInt(rawBudget, 0, 200000, 0);
    return {
      provider,
      url: compact(raw.url || raw.base_url || raw.baseUrl || raw.llm_url || '', 1800),
      key: text(raw.key || raw.api_key || raw.apiKey || raw.llm_key || raw.token || '').trim(),
      model: text(raw.model || raw.llm_model || '').trim(),
      temp: clampNumber(raw.temp ?? raw.temperature ?? raw.llm_temp ?? 0.35, 0, 2, 0.35),
      max_tokens: clampInt(raw.max_tokens || raw.max_completion_tokens || raw.llm_max_completion_tokens || raw.responseMaxTokens || DEFAULT_MAX_STAGE_TOKENS, 64, 200000, DEFAULT_MAX_STAGE_TOKENS),
      timeout_ms: timeoutFallback,
      request_format: providerSupportsResponses(provider) ? normalizeLLMRequestFormat(raw.request_format || raw.requestFormat || raw.llm_request_format || 'chat_completions') : 'chat_completions',
      reasoning_preset: normalizeReasoningPresetKey(raw.reasoning_preset || raw.reasoningPreset || raw.llm_reasoning_preset || 'auto'),
      reasoning_effort: normalizeChoice(raw.reasoning_effort || raw.reasoningEffort || raw.llm_reasoning_effort || 'none', ['none', 'low', 'medium', 'high'], 'none'),
      reasoning_budget_tokens: reasoningBudget,
      thinking_type: compact(thinkingType || 'enabled', 80),
      glm_thinking_type: compact(thinkingType, 80),
      stream: asBool(raw.stream ?? raw.llm_stream, false),
      service_tier: normalizeChoice(raw.service_tier || raw.llm_service_tier || 'off', ['off', 'auto', 'default', 'flex', 'priority', 'scale'], 'off'),
      custom_service_tier_passthrough: asBool(raw.custom_service_tier_passthrough ?? raw.service_tier_passthrough, false),
      vertex_flex_mode: normalizeChoice(raw.vertex_flex_mode || 'off', ['off', 'provisioned_then_flex', 'flex_only'], 'off'),
      extra_headers_json: compact(raw.extra_headers_json || raw.extra_headers || raw.headers || '', 6000),
      extra_body_json: compact(raw.extra_body_json || raw.extra_body || raw.body || raw.llm_extra_body_json || '', 12000)
    };
  };

  const defaultUrlForProvider = (provider) => {
    const p = canonicalProvider(provider);
    const direct = directProviderDefinition(p);
    return PROVIDER_PRESETS[p]?.url || direct?.baseUrl || '';
  };
  const defaultBaseForProvider = (provider) => {
    const p = canonicalProvider(provider);
    const direct = directProviderDefinition(p);
    return PROVIDER_PRESETS[p]?.baseUrl || direct?.baseUrl || defaultUrlForProvider(p);
  };
  const modeForProvider = (provider) => directProviderDefinition(provider) ? 'openai_compat' : (PROVIDER_PRESETS[canonicalProvider(provider)]?.mode || 'openai_compat');
  const providerAllowsEmptyKey = (provider) => {
    const p = canonicalProvider(provider);
    return !!PROVIDER_PRESETS[p]?.local || ['ollama', 'lmstudio', 'custom'].includes(p);
  };
  const providerRequiresUrl = (provider) => {
    const p = canonicalProvider(provider);
    return ['custom', 'vertex', 'vertex-openai'].includes(p) || directProviderDefinition(p)?.requiresConfiguredUrl === true;
  };
  const allowsEmptyKey = providerAllowsEmptyKey;

  const stripBearerPrefix = (value) => text(value || '').trim().replace(/^Bearer\s+/i, '').trim();

  const resolveProviderBaseUrl = (provider, rawUrl = '', mode = 'llm') => {
    const p = canonicalProvider(provider);
    const raw = text(rawUrl || '').trim();
    if (raw) return raw;
    if (mode === 'llm') return defaultBaseForProvider(p) || defaultUrlForProvider(p);
    return defaultBaseForProvider(p) || '';
  };

  const normalizeOpenAICompatUrl = (base = '', provider = 'custom', suffix = '/v1/chat/completions') => {
    const p = canonicalProvider(provider);
    let raw = String(base || resolveProviderBaseUrl(p, '', 'llm') || '').trim().replace(/\/+$/, '');
    if (!raw) return '';
    const direct = directProviderDefinition(p);
    if (direct) return resolveDirectProviderEndpoint(p, validateDirectProviderUrl(p, raw), 'chat');
    if (/\/v\d+\/(?:chat\/completions|responses|completions)(?:\?|$)/i.test(raw) || /\/chat\/completions(?:\?|$)/i.test(raw)) return raw;
    if (/\/v\d+$/i.test(raw)) return `${raw}${suffix.replace(/^\/v\d+/, '')}`;
    if (p === 'copilot') return raw === 'https://api.githubcopilot.com' ? `${raw}/chat/completions` : `${raw}/chat/completions`.replace(/\/chat\/completions\/chat\/completions$/i, '/chat/completions');
    if (p === 'openai' && raw === 'https://api.openai.com') return `${raw}/v1/chat/completions`;
    if (p === 'openrouter' && raw === 'https://openrouter.ai/api') return `${raw}/v1/chat/completions`;
    if (p === 'deepseek' && raw === 'https://api.deepseek.com') return `${raw}/chat/completions`;
    if (p === 'ollama_cloud' && raw === 'https://ollama.com') return `${raw}/v1/chat/completions`;
    if (p === 'nanogpt' && raw === 'https://nano-gpt.com/api') return `${raw}/v1/chat/completions`;
    if (p === 'nanogpt' && /\/api\/v\d+$/i.test(raw)) return `${raw}/chat/completions`;
    if (p === 'lmstudio' && !/\/v\d+$/i.test(raw)) return `${raw}/v1/chat/completions`.replace(/\/v1\/v1\//, '/v1/');
    return raw + suffix;
  };

  const ollamaApiUrl = (base = '', endpoint = '/api/chat') => {
    const raw = String(base || resolveProviderBaseUrl('ollama')).trim().replace(/\/+$/, '');
    const cleanEndpoint = `/${String(endpoint || '/api/chat').replace(/^\/+/, '')}`;
    if (!raw) return raw;
    if (raw.toLowerCase().endsWith(cleanEndpoint.toLowerCase())) return raw;
    if (/\/api\/(?:chat|generate|embed|embeddings|tags|show)(?:\?|$)/i.test(raw)) {
      return raw.replace(/\/api\/(?:chat|generate|embed|embeddings|tags|show)(?:\?.*)?$/i, cleanEndpoint);
    }
    if (/\/v\d+(?:\/(?:chat\/completions|responses|completions|embeddings))?(?:\?.*)?$/i.test(raw)) {
      return raw.replace(/\/v\d+(?:\/(?:chat\/completions|responses|completions|embeddings))?(?:\?.*)?$/i, cleanEndpoint);
    }
    if (/\/chat\/completions(?:\?.*)?$/i.test(raw)) {
      return raw.replace(/\/chat\/completions(?:\?.*)?$/i, cleanEndpoint);
    }
    if (/\/api$/i.test(raw)) return `${raw}${cleanEndpoint.replace(/^\/api/, '')}`;
    return `${raw}${cleanEndpoint}`;
  };

  const appendQueryParam = (url, pair) => {
    if (!pair) return url;
    return `${url}${url.includes('?') ? '&' : '?'}${pair}`;
  };

  const vertexUrlWithCredentials = (url, key) => {
    let out = String(url || defaultUrlForProvider('vertex') || '').trim();
    const parsed = tryJsonParse(key, null);
    if (parsed && typeof parsed === 'object') {
      const projectId = String(parsed.project_id || parsed.projectId || parsed.quota_project_id || '').trim();
      const location = String(parsed.location || parsed.region || parsed.vertex_location || 'global').trim() || 'global';
      if (projectId) out = out.replace(/PROJECT_ID|\{project_id\}|\$\{project_id\}/g, projectId);
      out = out.replace(/LOCATION|\{location\}|\$\{location\}/g, location);
    }
    return out;
  };

  const vertexOpenAIUrl = (base = '', key = '') => {
    const cleanBase = vertexUrlWithCredentials(base || defaultUrlForProvider('vertex-openai'), key).replace(/\/+$/, '');
    if (!cleanBase) return '';
    if (/:generateContent|:streamGenerateContent|\/publishers\/google\/models/i.test(cleanBase)) {
      throw new Error('Vertex OpenAI provider needs the Vertex OpenAI-compatible endpoint, not a direct Gemini endpoint.');
    }
    if (/\/chat\/completions(?:\?|$)/i.test(cleanBase)) return cleanBase;
    if (/\/endpoints\/openapi$/i.test(cleanBase)) return `${cleanBase}/chat/completions`;
    return normalizeOpenAICompatUrl(cleanBase, 'vertex-openai', '/chat/completions');
  };

  const normalizeGeminiApiEndpoint = (rawUrl, model, action = 'generateContent') => {
    const normalizedAction = action === 'streamGenerateContent' ? 'streamGenerateContent' : 'generateContent';
    let base = String(rawUrl || defaultUrlForProvider('gemini') || '').trim().replace(/\/+$/, '');
    if (!base) return '';
    if (/:generateContent|:streamGenerateContent/i.test(base)) return base.replace(/:(?:generateContent|streamGenerateContent)(?:\?.*)?$/i, `:${normalizedAction}`);
    if (/\/models\/[^/]+$/i.test(base)) return `${base}:${normalizedAction}`;
    if (/\/models$/i.test(base)) return `${base}/${encodeURIComponent(model)}:${normalizedAction}`;
    return `${base}/models/${encodeURIComponent(model)}:${normalizedAction}`;
  };

  const normalizeVertexGeminiEndpoint = (rawUrl, key, model, action = 'generateContent') => {
    const normalizedAction = action === 'streamGenerateContent' ? 'streamGenerateContent' : 'generateContent';
    let base = vertexUrlWithCredentials(rawUrl || defaultUrlForProvider('vertex'), key).trim().replace(/\/+$/, '');
    if (!base) return '';
    if (/:generateContent|:streamGenerateContent/i.test(base)) return base.replace(/:(?:generateContent|streamGenerateContent)(?:\?.*)?$/i, `:${normalizedAction}`);
    if (/\/models\/[^/]+$/i.test(base)) return `${base}:${normalizedAction}`;
    return `${base}/${encodeURIComponent(model)}:${normalizedAction}`;
  };

  const readObject = async (key, fallback = {}) => {
    const raw = await RisuCompat.getItem(key);
    const parsed = typeof raw === 'string' ? tryJsonParse(raw, fallback) : raw;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  };

  const writeObject = async (key, value) => await RisuCompat.setItem(key, JSON.stringify(value ?? {}, null, 2));

  const readProviderSecrets = async () => {
    const raw = await RisuCompat.localGetItem(LOCAL_PROVIDER_SECRETS_KEY);
    const parsed = typeof raw === 'string' ? tryJsonParse(raw, {}) : raw;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  };

  const writeProviderSecrets = async (secrets) => {
    const clean = {};
    for (const [name, value] of Object.entries(secrets || {})) {
      const key = String(name || '').trim();
      const secret = text(value || '').trim();
      if (key && secret) clean[key] = secret;
    }
    if (!Object.keys(clean).length) {
      await RisuCompat.localRemoveItem(LOCAL_PROVIDER_SECRETS_KEY);
      return true;
    }
    return await RisuCompat.localSetItem(LOCAL_PROVIDER_SECRETS_KEY, clean);
  };

  const stripPresetSecret = (preset) => {
    const clean = sanitizePreset(preset || {});
    delete clean.key;
    return clean;
  };

  const readStoredPresetBank = async () => {
    const metadata = await readObject(STORAGE_PROVIDER_PRESETS_KEY, {});
    const secrets = await readProviderSecrets();
    const bank = {};
    for (const [name, preset] of Object.entries(metadata || {})) {
      const key = String(name || '').trim();
      if (!key || !preset || typeof preset !== 'object') continue;
      bank[key] = sanitizePreset({ ...preset, key: secrets[key] || preset.key || '' });
    }
    return bank;
  };

  const writeStoredPresetBank = async (bank) => {
    const metadata = {};
    const previousSecrets = await readProviderSecrets();
    const secrets = {};
    for (const [name, rawPreset] of Object.entries(bank || {})) {
      const key = String(name || '').trim();
      if (!key || !rawPreset || typeof rawPreset !== 'object') continue;
      const preset = sanitizePreset(rawPreset);
      metadata[key] = stripPresetSecret(preset);
      const incomingHasSecret = Object.prototype.hasOwnProperty.call(rawPreset, 'key')
        || Object.prototype.hasOwnProperty.call(rawPreset, 'api_key')
        || Object.prototype.hasOwnProperty.call(rawPreset, 'apiKey')
        || Object.prototype.hasOwnProperty.call(rawPreset, 'llm_key')
        || Object.prototype.hasOwnProperty.call(rawPreset, 'token');
      const secret = incomingHasSecret ? preset.key : previousSecrets[key];
      if (secret) secrets[key] = secret;
    }
    const secretOk = await writeProviderSecrets(secrets);
    if (!secretOk) return false;
    const metaOk = await writeObject(STORAGE_PROVIDER_PRESETS_KEY, metadata);
    return !!metaOk;
  };

  const unwrapVersionedStore = (raw, field) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const nested = raw[field];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) return nested;
    const copy = { ...raw };
    delete copy.version;
    delete copy.savedAt;
    return copy;
  };

  const normalizeRuntimeRecord = (raw = {}) => {
    const source = unwrapVersionedStore(raw, 'settings');
    const aliases = {
      turnWindow: 'turn_window', maxRecentChars: 'max_recent_chars', maxPreviousStageChars: 'max_previous_stage_chars',
      maxInjectionChars: 'max_injection_chars', injectionPosition: 'injection_position', failureMode: 'failure_mode',
      stageTimeoutMs: 'stage_timeout_ms', defaultPresetName: 'default_preset', afterProcessMode: 'after_process_mode',
      afterMaxResponseChars: 'after_max_response_chars', gradationMode: 'gradation_mode', outputMode: 'output_mode', builtInStylePreset: 'built_in_style_preset', debugLog: 'debug_log', enableShadowRisuContext: 'shadow_include_risu_context', shadowRisuContextMaxChars: 'shadow_risu_context_max_chars', twoCallAide: 'two_call_aide', targetDraftMinChars: 'target_draft_min_chars', targetDraftMaxChars: 'target_draft_max_chars', guiEnabled: 'enable_gui',
      backendHosting: 'backendHosting', backendHostingMode: 'backend_hosting_mode', backendHostingUrl: 'backend_hosting_url', backendHostingToken: 'backend_hosting_token', backendHostingAutoDetected: 'backend_hosting_auto_detected', backendHostingLastDetectedAt: 'backend_hosting_last_detected_at', backendHostingLastManifest: 'backend_hosting_last_manifest'
    };
    const out = {};
    for (const [key, value] of Object.entries(source || {})) out[aliases[key] || key] = value;
    return out;
  };

  const defaultStoredStageSlot = (stageId, fallback = {}) => ({
    enabled: fallback.enabled ?? true,
    preset: compact(fallback.preset ?? fallback.presetName ?? '', 120),
    max_chars: clampInt(fallback.max_chars ?? fallback.maxChars, 1000, 100000, DEFAULT_STAGE_CONTEXT_CHARS),
    turn_window: clampInt(fallback.turn_window ?? fallback.turnWindow, 1, 64, DEFAULT_RECENT_TURNS),
    timeout_ms: clampInt(fallback.timeout_ms ?? fallback.timeoutMs, 5000, 300000, DEFAULT_STAGE_TIMEOUT_MS),
    execution_mode: normalizeChoice(fallback.execution_mode ?? fallback.executionMode ?? defaultExecutionModeForStage(stageId), ['analysis_draft', 'draft_only'], defaultExecutionModeForStage(stageId)),
    risu_refs: normalizeRisuReferences(fallback.risu_refs ?? fallback.risuRefs, defaultRisuReferencesForStage(stageId))
  });

  const normalizeAgentSlotRecord = (value = {}, fallback = {}, stageId = '') => {
    const defaults = defaultStoredStageSlot(stageId, fallback);
    return {
      enabled: value?.enabled ?? defaults.enabled,
      preset: compact(value?.preset ?? value?.presetName ?? defaults.preset ?? '', 120),
      max_chars: clampInt(value?.max_chars ?? value?.maxChars, 1000, 100000, defaults.max_chars),
      turn_window: clampInt(value?.turn_window ?? value?.turnWindow, 1, 64, defaults.turn_window),
      timeout_ms: clampInt(value?.timeout_ms ?? value?.timeoutMs, 5000, 300000, defaults.timeout_ms),
      execution_mode: normalizeChoice(value?.execution_mode ?? value?.executionMode ?? defaults.execution_mode, ['analysis_draft', 'draft_only'], defaults.execution_mode),
      risu_refs: normalizeRisuReferences(value?.risu_refs ?? value?.risuRefs, defaults.risu_refs)
    };
  };

  const normalizeStoredStageSlot = (value = {}, stageId = '', fillDefaults = false) => {
    if (fillDefaults) return normalizeAgentSlotRecord(value, {}, stageId);
    const out = {};
    if (Object.prototype.hasOwnProperty.call(value, 'enabled')) out.enabled = value.enabled;
    if (['preset', 'presetName'].some(key => Object.prototype.hasOwnProperty.call(value, key))) out.preset = compact(value.preset ?? value.presetName ?? '', 120);
    if (['max_chars', 'maxChars'].some(key => Object.prototype.hasOwnProperty.call(value, key))) out.max_chars = clampInt(value.max_chars ?? value.maxChars, 1000, 100000, DEFAULT_STAGE_CONTEXT_CHARS);
    if (['turn_window', 'turnWindow'].some(key => Object.prototype.hasOwnProperty.call(value, key))) out.turn_window = clampInt(value.turn_window ?? value.turnWindow, 1, 64, DEFAULT_RECENT_TURNS);
    if (['timeout_ms', 'timeoutMs'].some(key => Object.prototype.hasOwnProperty.call(value, key))) out.timeout_ms = clampInt(value.timeout_ms ?? value.timeoutMs, 5000, 300000, DEFAULT_STAGE_TIMEOUT_MS);
    if (['execution_mode', 'executionMode'].some(key => Object.prototype.hasOwnProperty.call(value, key))) out.execution_mode = normalizeChoice(value.execution_mode ?? value.executionMode, ['analysis_draft', 'draft_only'], defaultExecutionModeForStage(stageId));
    if (['risu_refs', 'risuRefs'].some(key => Object.prototype.hasOwnProperty.call(value, key))) out.risu_refs = normalizeRisuReferences(value.risu_refs ?? value.risuRefs, defaultRisuReferencesForStage(stageId));
    return out;
  };

  const normalizeStoredAgentSlots = (raw = {}, fillDefaults = false) => {
    const source = unwrapVersionedStore(raw, 'slots');
    const out = {};
    for (const def of BEFORE_STAGE_DEFS) {
      if (source?.[def.id] && typeof source[def.id] === 'object') out[def.id] = normalizeStoredStageSlot(source[def.id], def.id, fillDefaults);
    }
    out.custom_analysis_agents = normalizeCustomAnalysisAgents(source?.custom_analysis_agents ?? source?.customAnalysisAgents ?? []);
    return out;
  };

  const normalizeStoredPostProcessors = (raw = {}, fillDefaults = false) => {
    const source = unwrapVersionedStore(raw, 'processors');
    const out = {};
    const wrapperMode = raw && typeof raw === 'object' ? raw.mode : undefined;
    const mode = source?.mode ?? wrapperMode;
    if (mode !== undefined) out.mode = mode;
    for (const def of LEGACY_POST_STAGE_DEFS) {
      if (source?.[def.id] && typeof source[def.id] === 'object') out[def.id] = normalizeStoredStageSlot(source[def.id], def.id, fillDefaults);
    }
    out.custom_post_agents = normalizeCustomPostAgents(source?.custom_post_agents ?? source?.customPostAgents ?? raw?.custom_post_agents ?? raw?.customPostAgents ?? []);
    return out;
  };

  // Legacy storage/API names use customPrompt + replace. Semantically this is
  // direction guidance only; built-in prompt structure is never replaced.
  const normalizePromptMode = (value, customPrompt = '') => {
    const mode = text(value || '').trim().toLowerCase();
    if (['replace', 'custom', 'custom_replace'].includes(mode)) return 'replace';
    if (['builtin', 'built_in', 'default'].includes(mode)) return 'builtin';
    return compact(customPrompt, 1) ? 'replace' : 'builtin';
  };

  const normalizePromptRecordEntry = (value = {}) => {
    const customPrompt = text(value?.customPrompt ?? value?.custom_prompt ?? value?.prompt ?? '');
    return {
      mode: normalizePromptMode(value?.mode, customPrompt),
      customPrompt,
      extraPrompt: text(value?.extraPrompt ?? value?.extra_prompt ?? '')
    };
  };

  const normalizeStoredPromptOverrides = (raw = {}) => {
    const source = unwrapVersionedStore(raw, 'prompts');
    const out = { before: {}, post: {} };
    if (source?.before || source?.post) {
      for (const def of BEFORE_STAGE_DEFS) if (source?.before?.[def.id]) out.before[def.id] = normalizePromptRecordEntry(source.before[def.id]);
      for (const def of LEGACY_POST_STAGE_DEFS) if (source?.post?.[def.id]) out.post[def.id] = normalizePromptRecordEntry(source.post[def.id]);
    } else {
      for (const def of BEFORE_STAGE_DEFS) if (source?.[def.id]) out.before[def.id] = normalizePromptRecordEntry(source[def.id]);
      for (const def of LEGACY_POST_STAGE_DEFS) if (source?.[def.id]) out.post[def.id] = normalizePromptRecordEntry(source[def.id]);
    }
    return out;
  };

  const readRuntimeSettings = async () => normalizeRuntimeRecord(await readObject(STORAGE_RUNTIME_SETTINGS_KEY, {}));
  const writeRuntimeSettings = async (value) => {
    const settings = normalizeRuntimeRecord(value || {});
    return await writeObject(STORAGE_RUNTIME_SETTINGS_KEY, { version: 2, savedAt: new Date().toISOString(), settings });
  };
  const readAgentSlots = async () => normalizeStoredAgentSlots(await readObject(STORAGE_AGENT_SLOTS_KEY, {}));
  const writeAgentSlots = async (value) => {
    const slots = normalizeStoredAgentSlots(value || {}, true);
    return await writeObject(STORAGE_AGENT_SLOTS_KEY, { version: 2, savedAt: new Date().toISOString(), slots });
  };
  const readPostProcessors = async () => normalizeStoredPostProcessors(await readObject(STORAGE_POST_PROCESSORS_KEY, {}));
  const writePostProcessors = async (value) => {
    const processors = normalizeStoredPostProcessors(value || {}, true);
    return await writeObject(STORAGE_POST_PROCESSORS_KEY, { version: 2, savedAt: new Date().toISOString(), processors });
  };
  const readPromptOverrides = async () => normalizeStoredPromptOverrides(await readObject(STORAGE_PROMPT_OVERRIDES_KEY, {}));
  const writePromptOverrides = async (value) => {
    const prompts = normalizeStoredPromptOverrides(value || {});
    return await writeObject(STORAGE_PROMPT_OVERRIDES_KEY, { version: 2, savedAt: new Date().toISOString(), prompts });
  };


  const legacyFlatToSections = (flat = {}) => ({
    runtime: {
      mode: flat.mode,
      turn_window: flat.turn_window,
      max_recent_chars: flat.max_recent_chars,
      max_previous_stage_chars: flat.max_previous_stage_chars,
      max_injection_chars: flat.max_injection_chars,
      injection_position: flat.injection_position,
      failure_mode: flat.failure_mode,
      stage_timeout_ms: flat.stage_timeout_ms,
      default_preset: flat.default_preset,
      after_max_response_chars: flat.after_max_response_chars,
      shadow_include_risu_context: flat.shadow_include_risu_context,
      shadow_risu_context_max_chars: flat.shadow_risu_context_max_chars,
      backend_hosting_mode: flat.backend_hosting_mode,
      backend_hosting_url: flat.backend_hosting_url,
      backend_hosting_token: flat.backend_hosting_token,
      backend_hosting_auto_detected: flat.backend_hosting_auto_detected,
      backend_hosting_last_detected_at: flat.backend_hosting_last_detected_at,
      backend_hosting_last_manifest: flat.backend_hosting_last_manifest,
      debug_log: flat.debug_log,
      enable_gui: flat.enable_gui
    },
    agents: {
      shadow_act: { enabled: flat.enable_shadow_act, preset: flat.shadow_act_preset },
      aide_character: { enabled: flat.enable_character_aide, preset: flat.character_aide_preset },
      aide_world: { enabled: flat.enable_world_aide, preset: flat.world_aide_preset },
      aide_plot: { enabled: flat.enable_plot_aide, preset: flat.plot_aide_preset }
    },
    post: {
      mode: flat.after_process_mode,
      post_character_check: { enabled: flat.enable_post_character_check, preset: flat.post_character_preset },
      post_world_check: { enabled: flat.enable_post_world_check, preset: flat.post_world_preset },
      post_plot_check: { enabled: flat.enable_post_plot_check, preset: flat.post_plot_preset },
      post_korean_check: { enabled: flat.enable_post_korean_check, preset: flat.post_korean_preset }
    },
    prompts: {
      before: {
        shadow_act: { mode: flat.shadow_prompt_custom ? 'replace' : 'builtin', customPrompt: flat.shadow_prompt_custom || '', extraPrompt: flat.shadow_prompt_extra || '' },
        aide_character: { mode: flat.character_prompt_custom ? 'replace' : 'builtin', customPrompt: flat.character_prompt_custom || '', extraPrompt: flat.character_prompt_extra || '' },
        aide_world: { mode: flat.world_prompt_custom ? 'replace' : 'builtin', customPrompt: flat.world_prompt_custom || '', extraPrompt: flat.world_prompt_extra || '' },
        aide_plot: { mode: flat.plot_prompt_custom ? 'replace' : 'builtin', customPrompt: flat.plot_prompt_custom || '', extraPrompt: flat.plot_prompt_extra || '' }
      },
      post: {
        post_character_check: { mode: flat.post_character_prompt_custom ? 'replace' : 'builtin', customPrompt: flat.post_character_prompt_custom || '' },
        post_world_check: { mode: flat.post_world_prompt_custom ? 'replace' : 'builtin', customPrompt: flat.post_world_prompt_custom || '' },
        post_plot_check: { mode: flat.post_plot_prompt_custom ? 'replace' : 'builtin', customPrompt: flat.post_plot_prompt_custom || '' },
        post_korean_check: { mode: flat.post_korean_prompt_custom ? 'replace' : 'builtin', customPrompt: flat.post_korean_prompt_custom || '' }
      }
    }
  });

  let migrationPromise = null;
  const awaitMigrationPromise = async () => {
    try {
      return await migrationPromise;
    } catch (error) {
      migrationPromise = null;
      const message = compact(error?.message || error, 500);
      Runtime.migration = { version: 2, failed: true, failedAt: new Date().toISOString(), reason: message };
      Runtime.warnings.push({ at: Date.now(), msg: `[migration failed] ${message}` });
      if (Runtime.warnings.length > 60) Runtime.warnings.shift();
      throw error;
    }
  };
  const ensureV2Migration = async () => {
    if (migrationPromise) return await awaitMigrationPromise();
    migrationPromise = (async () => {
      const marker = await readObject(STORAGE_MIGRATION_KEY, {});
      if (marker?.version === 2) { Runtime.migration = marker; Runtime.migratedFrom = marker.source || null; return marker; }
      const legacySettings = await readObject(LEGACY_STORAGE_SETTINGS_KEY, {});
      const legacyPresets = await readObject(LEGACY_STORAGE_PRESETS_KEY, {});
      const sections = legacyFlatToSections(legacySettings);
      const hasNewRuntime = Object.keys(await readRuntimeSettings()).length > 0;
      const hasNewAgents = Object.keys(await readAgentSlots()).length > 0;
      const hasNewPost = Object.keys(await readPostProcessors()).length > 0;
      const existingPrompts = await readPromptOverrides();
      const hasNewPrompts = Object.keys(existingPrompts?.before || {}).length > 0 || Object.keys(existingPrompts?.post || {}).length > 0;
      const hasNewProviders = Object.keys(await readObject(STORAGE_PROVIDER_PRESETS_KEY, {})).length > 0;
      if (!hasNewRuntime && Object.keys(legacySettings).length) await writeRuntimeSettings(sections.runtime);
      if (!hasNewAgents && Object.keys(legacySettings).length) await writeAgentSlots(sections.agents);
      if (!hasNewPost && Object.keys(legacySettings).length) await writePostProcessors(sections.post);
      if (!hasNewPrompts && Object.keys(legacySettings).length) await writePromptOverrides(sections.prompts);
      if (!hasNewProviders && Object.keys(legacyPresets).length) await writeStoredPresetBank(legacyPresets);
      const migrated = Object.keys(legacySettings).length || Object.keys(legacyPresets).length;
      const next = { version: 2, migrated: !!migrated, migratedAt: new Date().toISOString(), source: migrated ? 'v0.4.x' : 'fresh' };
      await writeObject(STORAGE_MIGRATION_KEY, next);
      Runtime.migratedFrom = next.source;
      Runtime.migration = next;
      return next;
    })();
    return await awaitMigrationPromise();
  };

  const readStoredSettings = async () => {
    await ensureV2Migration();
    return {
      runtime: await readRuntimeSettings(),
      agentSlots: await readAgentSlots(),
      postProcessors: await readPostProcessors(),
      promptOverrides: await readPromptOverrides()
    };
  };

  const writeStoredSettings = async (flat = {}) => {
    await ensureV2Migration();
    const current = await readStoredSettings();
    const sections = legacyFlatToSections(flat || {});
    const compactObject = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''));
    const runtime = { ...(current.runtime || {}), ...compactObject(sections.runtime) };
    const agents = { ...(current.agentSlots || {}) };
    for (const [stage, value] of Object.entries(sections.agents || {})) agents[stage] = { ...(agents[stage] || {}), ...compactObject(value) };
    const post = { ...(current.postProcessors || {}) };
    if (sections.post.mode !== undefined && sections.post.mode !== null && sections.post.mode !== '') post.mode = sections.post.mode;
    for (const [stage, value] of Object.entries(sections.post || {})) {
      if (stage === 'mode') continue;
      post[stage] = { ...(post[stage] || {}), ...compactObject(value) };
    }
    const prompts = JSON.parse(JSON.stringify(current.promptOverrides || { before: {}, post: {} }));
    prompts.before ||= {};
    prompts.post ||= {};
    for (const [stage, value] of Object.entries(sections.prompts.before || {})) prompts.before[stage] = { ...(prompts.before[stage] || {}), ...compactObject(value) };
    for (const [stage, value] of Object.entries(sections.prompts.post || {})) prompts.post[stage] = { ...(prompts.post[stage] || {}), ...compactObject(value) };
    const results = await Promise.all([writeRuntimeSettings(runtime), writeAgentSlots(agents), writePostProcessors(post), writePromptOverrides(prompts)]);
    Runtime.settings = null;
    return results.every(Boolean);
  };

  const removeStoredSettings = async () => {
    const results = await Promise.all([
      RisuCompat.removeItem(STORAGE_RUNTIME_SETTINGS_KEY),
      RisuCompat.removeItem(STORAGE_AGENT_SLOTS_KEY),
      RisuCompat.removeItem(STORAGE_POST_PROCESSORS_KEY),
      RisuCompat.removeItem(STORAGE_PROMPT_OVERRIDES_KEY)
    ]);
    Runtime.settings = null;
    return results.some(Boolean);
  };

  const loadPresetBank = async (settings) => {
    await ensureV2Migration();
    const fromArgRaw = await getArgument('model_presets_json', '');
    const fromProviderArgRaw = await getArgument('provider_presets_json', '');
    const fromArg = tryJsonParse(fromArgRaw, {});
    const fromProviderArg = tryJsonParse(fromProviderArgRaw, {});
    const stored = await readStoredPresetBank();
    const bank = {};
    const fallbackPreset = sanitizePreset({
      provider: await getArgument('llm_provider', 'custom'),
      url: await getArgument('llm_url', ''),
      key: await getArgument('llm_key', ''),
      model: await getArgument('llm_model', ''),
      temp: await getArgument('llm_temp', '0.35'),
      timeout_ms: await getArgument('llm_timeout_ms', await getArgument('llm_timeout', settings.stageTimeoutMs)),
      max_tokens: await getArgument('llm_max_completion_tokens', DEFAULT_MAX_STAGE_TOKENS),
      request_format: await getArgument('llm_request_format', 'chat_completions'),
      reasoning_preset: await getArgument('llm_reasoning_preset', 'auto'),
      reasoning_effort: await getArgument('llm_reasoning_effort', 'none'),
      reasoning_budget_tokens: await getArgument('llm_reasoning_budget_tokens', 0),
      thinking_type: await getArgument('llm_thinking_type', await getArgument('llm_glm_thinking_type', await getArgument('llm_glm_thinking', 'enabled'))),
      glm_thinking_type: await getArgument('llm_glm_thinking_type', await getArgument('llm_glm_thinking', '')),
      service_tier: await getArgument('llm_service_tier', 'off'),
      custom_service_tier_passthrough: await getArgument('custom_service_tier_passthrough', 'false'),
      vertex_flex_mode: await getArgument('vertex_flex_mode', 'off'),
      stream: await getArgument('llm_stream', 'false'),
      extra_body_json: await getArgument('llm_extra_body_json', '')
    });
    bank.default = fallbackPreset;
    const mergeBank = (source) => {
      if (!source || typeof source !== 'object' || Array.isArray(source)) return;
      const presets = source.presets && typeof source.presets === 'object' ? source.presets : source;
      for (const [name, preset] of Object.entries(presets)) {
        const key = String(name || '').trim();
        if (!key || !preset || typeof preset !== 'object') continue;
        bank[key] = sanitizePreset(preset);
      }
    };
    mergeBank(fromProviderArg);
    mergeBank(fromArg);
    mergeBank(stored);
    Runtime.providerPresets = JSON.parse(JSON.stringify(bank));
    return bank;
  };

  const loadSettings = async () => {
    await ensureV2Migration();
    const runtimeStored = await readRuntimeSettings();
    const agentSlots = await readAgentSlots();
    const postProcessors = await readPostProcessors();
    const promptOverrides = await readPromptOverrides();
    const runtimeCfg = async (name, fallback = '') => Object.prototype.hasOwnProperty.call(runtimeStored, name) ? runtimeStored[name] : await getArgument(name, fallback);
    const slotCfg = async (stage, key, argName, fallback = '') => Object.prototype.hasOwnProperty.call(agentSlots?.[stage] || {}, key) ? agentSlots[stage][key] : await getArgument(argName, fallback);
    const postCfg = async (stage, key, argName, fallback = '') => Object.prototype.hasOwnProperty.call(postProcessors?.[stage] || {}, key) ? postProcessors[stage][key] : await getArgument(argName, fallback);
    const promptCfg = async (group, stage, key, argName, fallback = '') => Object.prototype.hasOwnProperty.call(promptOverrides?.[group]?.[stage] || {}, key) ? promptOverrides[group][stage][key] : await getArgument(argName, fallback);

    const mode = normalizeChoice(await runtimeCfg('mode', 'normal'), ['off', 'lite', 'normal', 'full'], 'normal');
    const gradationMode = normalizeChoice(await runtimeCfg('gradation_mode', 'full_draft'), ['full_draft'], 'full_draft');
    const outputMode = normalizeChoice(await runtimeCfg('output_mode', 'draft_guided'), OUTPUT_MODES, 'draft_guided');
    const builtInStylePreset = normalizeBuiltInStylePreset(await runtimeCfg('built_in_style_preset', 'unified_stylepack'));
    const injectionPosition = normalizeChoice(await runtimeCfg('injection_position', 'first_system'), ['first_system', 'last_system', 'before_last_user'], 'first_system');
    const failureMode = normalizeChoice(await runtimeCfg('failure_mode', 'soft'), ['soft', 'degraded', 'hard'], 'soft');
    const afterProcessModeSource = Object.prototype.hasOwnProperty.call(postProcessors, 'mode')
      ? postProcessors.mode
      : Object.prototype.hasOwnProperty.call(runtimeStored, 'after_process_mode')
        ? runtimeStored.after_process_mode
        : await getArgument('after_process_mode', 'off');
    const afterProcessMode = normalizeChoice(afterProcessModeSource, ['off', 'audit', 'rewrite'], 'off');
    const backendStored = normalizeBackendHostingConfig(runtimeStored.backendHosting || {});
    const backendHosting = normalizeBackendHostingConfig({
      ...backendStored,
      mode: await runtimeCfg('backend_hosting_mode', backendStored.mode || 'off'),
      url: await runtimeCfg('backend_hosting_url', backendStored.url || ''),
      token: await runtimeCfg('backend_hosting_token', backendStored.token || ''),
      autoDetected: await runtimeCfg('backend_hosting_auto_detected', backendStored.autoDetected ? 'true' : 'false'),
      lastDetectedAt: await runtimeCfg('backend_hosting_last_detected_at', backendStored.lastDetectedAt || ''),
      lastManifest: await runtimeCfg('backend_hosting_last_manifest', backendStored.lastManifest ? JSON.stringify(backendStored.lastManifest) : '')
    });

    const beforeCustomPrompts = {};
    const beforePromptModes = {};
    const beforeExtraPrompts = {};
    const beforePromptSpec = [
      ['shadow_act', 'shadow_prompt_custom', 'shadow_prompt_extra'],
      ['aide_character', 'character_prompt_custom', 'character_prompt_extra'],
      ['aide_world', 'world_prompt_custom', 'world_prompt_extra'],
      ['aide_plot', 'plot_prompt_custom', 'plot_prompt_extra']
    ];
    for (const [stage, customArg, extraArg] of beforePromptSpec) {
      const custom = compact(await promptCfg('before', stage, 'customPrompt', customArg, ''), 20000);
      beforeCustomPrompts[stage] = custom;
      const modeArg = { shadow_act: 'shadow_prompt_mode', aide_character: 'character_prompt_mode', aide_world: 'world_prompt_mode', aide_plot: 'plot_prompt_mode' }[stage];
      beforePromptModes[stage] = normalizeChoice(await promptCfg('before', stage, 'mode', modeArg, custom ? 'replace' : 'builtin'), ['builtin', 'replace'], custom ? 'replace' : 'builtin');
      beforeExtraPrompts[stage] = compact(await promptCfg('before', stage, 'extraPrompt', extraArg, ''), 6000);
    }

    const postCustomPrompts = {};
    const postPromptModes = {};
    const postPromptSpec = [
      ['post_character_check', 'post_character_prompt_custom'],
      ['post_world_check', 'post_world_prompt_custom'],
      ['post_plot_check', 'post_plot_prompt_custom'],
      ['post_korean_check', 'post_korean_prompt_custom']
    ];
    for (const [stage, argName] of postPromptSpec) {
      const custom = compact(await promptCfg('post', stage, 'customPrompt', argName, ''), 20000);
      postCustomPrompts[stage] = custom;
      const modeArg = { post_character_check: 'post_character_prompt_mode', post_world_check: 'post_world_prompt_mode', post_plot_check: 'post_plot_prompt_mode', post_korean_check: 'post_korean_prompt_mode' }[stage];
      postPromptModes[stage] = normalizeChoice(await promptCfg('post', stage, 'mode', modeArg, custom ? 'replace' : 'builtin'), ['builtin', 'replace'], custom ? 'replace' : 'builtin');
    }

    const settings = {
      mode,
      gradationMode,
      outputMode,
      builtInStylePreset,
      turnWindow: clampInt(await runtimeCfg('turn_window', DEFAULT_RECENT_TURNS), 2, 64, DEFAULT_RECENT_TURNS),
      maxRecentChars: clampInt(await runtimeCfg('max_recent_chars', DEFAULT_MAX_RECENT_CHARS), 2000, 100000, DEFAULT_MAX_RECENT_CHARS),
      maxPreviousStageChars: clampInt(await runtimeCfg('max_previous_stage_chars', DEFAULT_MAX_PREVIOUS_STAGE_CHARS), 1000, 60000, DEFAULT_MAX_PREVIOUS_STAGE_CHARS),
      maxInjectionChars: clampInt(await runtimeCfg('max_injection_chars', DEFAULT_MAX_INJECTION_CHARS), 1500, 60000, DEFAULT_MAX_INJECTION_CHARS),
      injectionPosition,
      failureMode,
      stageTimeoutMs: clampInt(await runtimeCfg('stage_timeout_ms', DEFAULT_STAGE_TIMEOUT_MS), 5000, 300000, DEFAULT_STAGE_TIMEOUT_MS),
      defaultPresetName: compact(await runtimeCfg('default_preset', 'default'), 120) || 'default',
      stagePresetNames: {
        shadow_act: compact(await slotCfg('shadow_act', 'preset', 'shadow_act_preset', ''), 120),
        aide_character: compact(await slotCfg('aide_character', 'preset', 'character_aide_preset', ''), 120),
        aide_world: compact(await slotCfg('aide_world', 'preset', 'world_aide_preset', ''), 120),
        aide_plot: compact(await slotCfg('aide_plot', 'preset', 'plot_aide_preset', ''), 120),
        post_character_check: compact(await postCfg('post_character_check', 'preset', 'post_character_preset', ''), 120),
        post_world_check: compact(await postCfg('post_world_check', 'preset', 'post_world_preset', ''), 120),
        post_plot_check: compact(await postCfg('post_plot_check', 'preset', 'post_plot_preset', ''), 120),
        post_korean_check: compact(await postCfg('post_korean_check', 'preset', 'post_korean_preset', ''), 120)
      },
      enableShadowAct: asBool(await slotCfg('shadow_act', 'enabled', 'enable_shadow_act', 'true'), true),
      enableCharacterAide: asBool(await slotCfg('aide_character', 'enabled', 'enable_character_aide', 'true'), true),
      enableWorldAide: asBool(await slotCfg('aide_world', 'enabled', 'enable_world_aide', 'true'), true),
      enablePlotAide: asBool(await slotCfg('aide_plot', 'enabled', 'enable_plot_aide', 'true'), true),
      shadowExtra: beforeExtraPrompts.shadow_act,
      characterExtra: beforeExtraPrompts.aide_character,
      worldExtra: beforeExtraPrompts.aide_world,
      plotExtra: beforeExtraPrompts.aide_plot,
      beforeCustomPrompts,
      beforePromptModes,
      beforeExtraPrompts,
      afterProcessMode,
      afterMaxResponseChars: clampInt(await runtimeCfg('after_max_response_chars', DEFAULT_AFTER_RESPONSE_CHARS), 2000, 80000, DEFAULT_AFTER_RESPONSE_CHARS),
      enablePostCharacter: asBool(await postCfg('post_character_check', 'enabled', 'enable_post_character_check', 'true'), true),
      enablePostWorld: asBool(await postCfg('post_world_check', 'enabled', 'enable_post_world_check', 'true'), true),
      enablePostPlot: asBool(await postCfg('post_plot_check', 'enabled', 'enable_post_plot_check', 'true'), true),
      enablePostKorean: asBool(await postCfg('post_korean_check', 'enabled', 'enable_post_korean_check', 'true'), true),
      postCharacterCustom: postCustomPrompts.post_character_check,
      postWorldCustom: postCustomPrompts.post_world_check,
      postPlotCustom: postCustomPrompts.post_plot_check,
      postKoreanCustom: postCustomPrompts.post_korean_check,
      postCustomPrompts,
      postPromptModes,
      enableShadowRisuContext: asBool(await runtimeCfg('shadow_include_risu_context', 'true'), true),
      shadowRisuContextMaxChars: clampInt(await runtimeCfg('shadow_risu_context_max_chars', DEFAULT_SHADOW_RISU_CONTEXT_CHARS), 1000, 80000, DEFAULT_SHADOW_RISU_CONTEXT_CHARS),
      twoCallAide: asBool(await runtimeCfg('two_call_aide', 'true'), true),
      targetDraftMinChars: clampInt(await runtimeCfg('target_draft_min_chars', DEFAULT_TARGET_DRAFT_MIN_CHARS), 100, 20000, DEFAULT_TARGET_DRAFT_MIN_CHARS),
      targetDraftMaxChars: clampInt(await runtimeCfg('target_draft_max_chars', DEFAULT_TARGET_DRAFT_MAX_CHARS), 500, 60000, DEFAULT_TARGET_DRAFT_MAX_CHARS),
      backendHosting,
      debugLog: asBool(await runtimeCfg('debug_log', 'false'), false),
      guiEnabled: asBool(await runtimeCfg('enable_gui', 'true'), true),
      runtimeStored,
      agentSlots,
      postProcessors,
      promptOverrides
    };
    settings.stageOptions = {};
    for (const def of BEFORE_STAGE_DEFS) {
      const legacyRefs = def.id === 'shadow_act' && settings.enableShadowRisuContext
        ? defaultRisuReferencesForStage(def.id)
        : { persona: false, characterDescription: false, characterLorebook: false, moduleLorebook: false };
      settings.stageOptions[def.id] = normalizeAgentSlotRecord(agentSlots?.[def.id] || {}, {
        enabled: def.id === 'shadow_act' ? settings.enableShadowAct
          : def.id === 'aide_character' ? settings.enableCharacterAide
            : def.id === 'aide_world' ? settings.enableWorldAide
              : settings.enablePlotAide,
        preset: settings.stagePresetNames?.[def.id] || '',
        max_chars: DEFAULT_STAGE_CONTEXT_CHARS,
        turn_window: settings.turnWindow,
        timeout_ms: settings.stageTimeoutMs,
        execution_mode: def.id === 'shadow_act' ? 'draft_only' : (settings.twoCallAide === false ? 'draft_only' : 'analysis_draft'),
        risu_refs: legacyRefs
      }, def.id);
    }
    for (const def of POST_STAGE_DEFS) {
      settings.stageOptions[def.id] = normalizeAgentSlotRecord(postProcessors?.[def.id] || {}, {
        enabled: def.id === 'post_character_check' ? settings.enablePostCharacter
          : def.id === 'post_world_check' ? settings.enablePostWorld
            : def.id === 'post_plot_check' ? settings.enablePostPlot
              : settings.enablePostKorean,
        preset: settings.stagePresetNames?.[def.id] || '',
        max_chars: DEFAULT_STAGE_CONTEXT_CHARS,
        turn_window: settings.turnWindow,
        timeout_ms: settings.stageTimeoutMs,
        execution_mode: 'draft_only',
        risu_refs: { persona: false, characterDescription: false, characterLorebook: false, moduleLorebook: false }
      }, def.id);
    }
    settings.customPostAgents = normalizeCustomPostAgents(postProcessors?.custom_post_agents ?? postProcessors?.customPostAgents ?? []);
    for (const agent of settings.customPostAgents) {
      settings.stagePresetNames[agent.id] = agent.preset;
      settings.stageOptions[agent.id] = normalizeAgentSlotRecord(agent, {
        enabled: agent.enabled,
        preset: agent.preset,
        max_chars: agent.max_chars,
        turn_window: agent.turn_window,
        timeout_ms: agent.timeout_ms,
        execution_mode: 'draft_only',
        risu_refs: { persona: false, characterDescription: false, characterLorebook: false, moduleLorebook: false }
      }, agent.id);
    }
    settings.customAnalysisAgents = normalizeCustomAnalysisAgents(agentSlots?.custom_analysis_agents ?? agentSlots?.customAnalysisAgents ?? []);
    for (const agent of settings.customAnalysisAgents) {
      settings.stageOptions[agent.id] = normalizeAgentSlotRecord(agent, {
        enabled: agent.enabled,
        preset: agent.preset,
        max_chars: agent.max_chars,
        turn_window: agent.turn_window,
        timeout_ms: agent.timeout_ms,
        execution_mode: 'draft_only',
        risu_refs: agent.risu_refs
      }, agent.id);
    }
    settings.presets = await loadPresetBank(settings);
    Runtime.settings = settings;
    return settings;
  };

  const resolvePreset = (settings, stageName) => {
    const stagePreset = settings.stagePresetNames?.[stageName] || settings.stageOptions?.[stageName]?.preset || '';
    const name = stagePreset || settings.defaultPresetName || 'default';
    const preset = settings.presets?.[name] || settings.presets?.[settings.defaultPresetName] || settings.presets?.default;
    return { name: settings.presets?.[name] ? name : 'default', preset: sanitizePreset(preset || {}) };
  };

  const stageExecutionOptions = (settings, stageName) => {
    const raw = settings?.stageOptions?.[stageName] || {};
    const defaults = defaultStoredStageSlot(stageName, {
      max_chars: DEFAULT_STAGE_CONTEXT_CHARS,
      turn_window: settings?.turnWindow ?? DEFAULT_RECENT_TURNS,
      timeout_ms: settings?.stageTimeoutMs ?? DEFAULT_STAGE_TIMEOUT_MS,
      execution_mode: stageName === 'shadow_act' ? 'draft_only' : (settings?.twoCallAide === false ? 'draft_only' : defaultExecutionModeForStage(stageName)),
      risu_refs: stageName === 'shadow_act' && settings?.enableShadowRisuContext
        ? defaultRisuReferencesForStage(stageName)
        : { persona: false, characterDescription: false, characterLorebook: false, moduleLorebook: false }
    });
    const normalized = normalizeAgentSlotRecord(raw, defaults, stageName);
    return {
      maxChars: normalized.max_chars,
      turnWindow: normalized.turn_window,
      timeoutMs: normalized.timeout_ms,
      executionMode: normalized.execution_mode,
      risuRefs: normalized.risu_refs
    };
  };

  const scopedSettingsForStage = (settings, stageName) => {
    const stage = stageExecutionOptions(settings, stageName);
    return {
      ...settings,
      turnWindow: stage.turnWindow,
      maxRecentChars: stage.maxChars,
      stageTimeoutMs: stage.timeoutMs,
      shadowRisuContextMaxChars: Math.min(stage.maxChars, settings?.shadowRisuContextMaxChars || DEFAULT_SHADOW_RISU_CONTEXT_CHARS),
      twoCallAide: stage.executionMode === 'analysis_draft',
      activeStageName: stageName,
      activeStageOptions: stage
    };
  };

  const stageHasRisuReferences = (settings, stageName) => {
    const refs = stageExecutionOptions(settings, stageName).risuRefs;
    return !!(refs.persona || refs.characterDescription || refs.characterLorebook || refs.moduleLorebook);
  };

  const providerConfigurationIssues = (preset) => {
    const issues = [];
    const provider = canonicalProvider(preset?.provider || 'custom');
    const mode = modeForProvider(provider);
    const url = preset?.url || defaultUrlForProvider(provider);
    if (!preset?.model) issues.push('missing_model');
    if (!url && !['gemini', 'ollama_native'].includes(mode)) issues.push('missing_url');
    if (!preset?.key && !providerAllowsEmptyKey(provider)) issues.push('missing_key');
    if (directProviderDefinition(provider)?.requiresConfiguredUrl && /(?:ACCOUNT_ID|GATEWAY_ID|\{[^}]+\})/i.test(String(url || ''))) issues.push('unresolved_url_placeholder');
    return issues;
  };

  const providerConfigured = (preset) => providerConfigurationIssues(preset).length === 0;

  const contentToText = (content) => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map(part => {
        if (!part) return '';
        if (typeof part === 'string') return part;
        if (part.type === 'text') return text(part.text || '');
        if (part.type === 'input_text') return text(part.text || '');
        if (part.type === 'image_url' || part.type === 'input_image') return '[image]';
        return compact(part, 400);
      }).filter(Boolean).join('\n');
    }
    return compact(content, 1200);
  };

  const normalizeMessages = (messages) => Array.isArray(messages)
    ? messages.map((msg, index) => {
        const role = text(msg?.role || 'unknown').toLowerCase();
        return {
          role,
          content: sanitizeMessageContentForHistory(role, contentToText(msg?.content)),
          name: text(msg?.name || ''),
          index
        };
      })
    : [];

  const isSgaInjectionText = (value) => text(value).includes(INJECTION_HEADER);

  const isLikelyMetaUserMessage = (value) => {
    const body = text(value).trim();
    if (!body) return true;
    if (isSgaInjectionText(body)) return true;
    if (/^(---|<\/?(?:Lore|Others Info|Last output|Past conversations|Image Commands|information)>|#\s*(?:Final Check|Tags|Expansion|Annotation Feature)|###\s*Status Interface)/i.test(body)) return true;
    if (/^system\s*:/i.test(body)) return true;
    if (/^Take my current input as inspiration/i.test(body)) return true;
    if (body.length > 1800 && /(?:Response template|Narration Principles|Content Policy|Character Information|Basic Information|Long-Term Memory Archive)/i.test(body)) return true;
    return false;
  };

  const isOthersInfoMessage = (value) => {
    const body = text(value).trim();
    if (!body) return false;
    return /<\/?(?:Others Info|Lore|Last output|Past conversations|Image Commands|information)>/i.test(body)
      || /(?:하야쿠|hayaku|packet reading|packet\s*read|패킷\s*리딩|LBDATA|Response template|Narration Principles|Content Policy|Character Information|Basic Information|Long-Term Memory Archive|Final Check|Tags|Expansion|Annotation Feature|Status Interface)/i.test(body);
  };

  const SGA_CURRENT_INPUT_TAGS = Object.freeze([
    { name: 'Current Input', source: 'Current\\s+Input' },
    { name: 'Latest User Input to Continue From', source: 'Latest\\s+User\\s+Input\\s+to\\s+Continue\\s+From' },
    { name: 'Physis', source: 'Physis' },
    { name: 'Writing Cue', source: 'Writing\\s+Cue' },
    { name: 'current_message', source: 'current_message' }
  ]);

  const hasSgaChatProvenance = (message) => {
    if (!message || typeof message !== 'object') return false;
    const direct = [
      message.memo,
      message.chatId,
      message.chat_id,
      message.messageId,
      message.message_id,
      message.m_id,
      message.msgId,
      message.saying
    ].some(value => text(value || '').trim());
    if (direct) return true;
    if (message.generationInfo && typeof message.generationInfo === 'object' && Object.keys(message.generationInfo).length > 0) return true;
    const stableId = text(message.id || message.uuid || message.uid || '').trim();
    const timestamp = Number(message.time || message.timestamp || message.createdAt || 0);
    return !!stableId && Number.isFinite(timestamp) && timestamp > 0;
  };

  const currentTurnRole = (message) => {
    const raw = text(message?.role || message?.type || message?.speaker || message?.sender || message?.from || message?.name || '').trim().toLowerCase();
    if (message?.isUser === true || message?.fromUser === true || /^(?:user|human|player|you|me)$/.test(raw) || raw.includes('user')) return 'user';
    if (message?.isAssistant === true || message?.isBot === true || message?.isChar === true || /^(?:assistant|model|bot|char|character|ai)$/.test(raw) || raw.includes('assistant') || raw.includes('bot')) return 'assistant';
    return raw;
  };

  const rawCurrentTurnBody = (message) => contentToText(
    message?.rawContentText
      ?? message?.contentText
      ?? message?.content
      ?? message?.message
      ?? message?.text
      ?? message?.data
      ?? message?.value
      ?? ''
  );

  const stripCurrentInputWrapper = (value) => {
    let body = text(value || '');
    for (const tag of SGA_CURRENT_INPUT_TAGS) {
      body = body
        .replace(new RegExp(`<\\s*${tag.source}\\b[^>]*>`, 'gi'), '')
        .replace(new RegExp(`<\\s*\\/\\s*${tag.source}\\s*>`, 'gi'), '');
    }
    const fence = body.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)\s*```/);
    if (fence) body = fence[1];
    body = body.replace(/^```(?:[a-zA-Z0-9_-]+)?\s*/gm, '').replace(/\s*```$/gm, '');
    body = body.replace(/Take my current input as inspiration[\s\S]*$/i, '');
    return compact(body, 6000);
  };

  // Current-input wrapper reader aligned with HAYAKU 2.0. Only the published
  // wrapper set and the generic Markdown carrier are recognized. Unknown
  // prompt-preset structures are deliberately not inferred.
  const latestSgaCurrentInputRange = (messages) => {
    const source = Array.isArray(messages) ? messages : [];
    for (let start = source.length - 1; start >= 0; start -= 1) {
      const startBody = rawCurrentTurnBody(source[start]);
      if (!startBody) continue;
      for (const tag of SGA_CURRENT_INPUT_TAGS) {
        const openRe = new RegExp(`<\\s*${tag.source}\\b[^>]*>`, 'i');
        const closeRe = new RegExp(`<\\s*\\/\\s*${tag.source}\\s*>`, 'i');
        const open = startBody.match(openRe);
        if (!open) continue;
        const tail = startBody.slice(Number(open.index || 0) + open[0].length);
        const inlineClose = tail.search(closeRe);
        if (inlineClose >= 0) {
          const current = stripCurrentInputWrapper(tail.slice(0, inlineClose));
          if (current) return { start, end: start, text: current, tag: tag.name };
          continue;
        }
        const parts = [tail];
        for (let end = start + 1; end < source.length; end += 1) {
          const next = source[end];
          if (currentTurnRole(next) === 'assistant') break;
          const body = rawCurrentTurnBody(next);
          const closeIndex = body.search(closeRe);
          if (closeIndex >= 0) {
            parts.push(body.slice(0, closeIndex));
            const current = stripCurrentInputWrapper(parts.join('\n'));
            if (current) return { start, end, text: current, tag: tag.name };
            break;
          }
          if (SGA_CURRENT_INPUT_TAGS.some(other => new RegExp(`<\\s*${other.source}\\b[^>]*>`, 'i').test(body))) break;
          parts.push(body);
        }
      }

      const mdHeaderRe = /^#\s*Current\s+Input\b/im;
      const mdOpen = startBody.match(mdHeaderRe);
      if (mdOpen) {
        const afterHeader = startBody.slice(Number(mdOpen.index || 0) + mdOpen[0].length);
        const fenceMatch = afterHeader.match(/```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```/);
        if (fenceMatch?.[1]) {
          const current = stripCurrentInputWrapper(fenceMatch[1]);
          if (current) return { start, end: start, text: current, tag: 'Current Input (markdown)' };
        }
        const lines = afterHeader.split(/\n/).filter(line => {
          const normalizedLine = text(line).trim();
          const risuTemplateControl = /^\{\{[#/:?]?[^{}]*\}\}$/.test(normalizedLine);
          return normalizedLine
            && !risuTemplateControl
            && !/^(?:[-*+]\s*)?(?:Proceed\b|Helpfully\b)/i.test(normalizedLine);
        });
        const current = stripCurrentInputWrapper(lines.join('\n'));
        if (current) return { start, end: start, text: current, tag: 'Current Input (markdown)' };
      }
    }
    return null;
  };

  const hasUnresolvedPromptTemplate = value => /\{\{[\s\S]{0,240}?\}\}|<%[\s\S]{0,240}?%>|\$\{[^}]{1,240}\}/.test(text(value));

  const findSgaTerminalAssistantPrefillIndex = (messages) => {
    const source = Array.isArray(messages) ? messages : [];
    for (let i = source.length - 1; i >= 0; i -= 1) {
      const message = source[i];
      if (currentTurnRole(message) !== 'assistant') continue;
      if (hasSgaChatProvenance(message)) continue;
      if (!rawCurrentTurnBody(message).trim()) continue;
      const laterChatTurn = source.slice(i + 1).some(item =>
        ['user', 'assistant'].includes(currentTurnRole(item))
        && hasSgaChatProvenance(item)
        && !isSgaInjectionText(rawCurrentTurnBody(item))
      );
      if (!laterChatTurn) return i;
    }
    return -1;
  };

  const currentInputFrom = (value) => {
    const body = text(value || '');
    for (const tag of SGA_CURRENT_INPUT_TAGS) {
      const open = `<\\s*${tag.source}\\b[^>]*>`;
      const close = `<\\s*\\/\\s*${tag.source}\\s*>`;
      const fenced = body.match(new RegExp(`${open}\\s*\`\`\`[a-zA-Z0-9_-]*\\s*([\\s\\S]*?)\\s*\`\`\`\\s*${close}`, 'i'));
      if (fenced?.[1]) return text(fenced[1]).trim();
      const plain = body.match(new RegExp(`${open}([\\s\\S]*?)${close}`, 'i'));
      if (plain?.[1]) return text(plain[1]).trim();
    }
    return '';
  };

  const SGA_HAYAKU_BACKSTAGE_PAYLOAD_RE = /\[HAYAKU [A-Z0-9][A-Z0-9 -]{1,100}\]/i;
  const SGA_EXTERNAL_MEMORY_INJECTION_RE = /\[VECTOR RAG MEMORY\]|\[[A-Z0-9_-]+\s+[^\]\n]{1,100}\s+Injection\]/i;
  const isBackstageUserPayload = value => SGA_HAYAKU_BACKSTAGE_PAYLOAD_RE.test(text(value));
  const isExternalMemoryInjectionPayload = value => isSgaInjectionText(value) || SGA_EXTERNAL_MEMORY_INJECTION_RE.test(text(value));

  const SgaCurrentInputRequestKind = (() => {
    const moduleMarkerPattern = /(?:<\s*\/?\s*(?:lb-[a-z0-9-]+|lightboard-[a-z0-9-]+)\b|\blb-(?:rerolling|pending|lazy|reroll|interaction-identifier|xnai)\b|재생성\s*중)/i;
    const hardAuxiliaryMarkerPattern = /(?:<\/?\s*lb-process\b|\blb-xnai-editing\b|\blb-xnai-gen\/|\[LightBoard\]|\bLightBoard\s+Backend\b|<\s*\/?\s*lightboard-[a-z0-9-]+\b|\[LBDATA START\][\s\S]*?(?:lb-rerolling|lb-pending|lb-interaction-identifier|lb-xnai))/i;
    const structuredImagePromptPattern = /(?:\b(?:positive|negative)\s+prompt\b|(?:네거티브|포지티브)\s*프롬프트|(?:sampler|cfg\s*scale|steps|seed|denoise|checkpoint|loras?|vae)\s*:|stable\s*diffusion|comfyui|image\s+prompt|illustration\s+prompt|삽화\s*프롬프트|이미지\s*프롬프트)/i;
    const structuredTranslationPromptPattern = /(?:translate\s+(?:the\s+following|to\b)|translation\s+request|source\s+language|target\s+language|번역\s*(?:요청|전용)|다음\s*(?:문장|텍스트|내용)을\s*번역|원문\s*:|번역문\s*:)/i;
    const lightBoardStructuredFormatMarkers = Object.freeze([
      '<lb-npclist>', '</lb-npclist>', '[characterlist|', 'char-history-wrapper',
      'char-history-content', 'char-info-row', '📜 과거 기록 보기'
    ]);
    const lightBoardStructuredGuidanceMarkers = Object.freeze([
      'must start with <lb-npclist>', 'every character must have all 7 base fields',
      'future relevance test', 'strictly exclude characters', 'fill every field completely',
      'structured character list output', 'specific format'
    ]);
    const separatorPattern = /^(?:[-_\s|:;,.·•~`'"()[\]{}<>/\\]+|#+|응답\s*없음|no\s+content|null|undefined)*$/i;
    const stripModuleArtifacts = value => text(value)
      .replace(/\[LBDATA START\][\s\S]*?\[LBDATA END\]/gi, ' ')
      .replace(/<\s*\/?\s*(?:lb-[a-z0-9-]+|lightboard-[a-z0-9-]+)\b[^>]*>/gi, ' ')
      .replace(/\blb-(?:rerolling|pending|lazy|reroll|interaction-identifier|xnai)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const isEffectivelyEmpty = value => {
      const clean = stripModuleArtifacts(value).trim();
      return !clean || separatorPattern.test(clean);
    };
    const isModuleOnlyPrompt = value => {
      const raw = text(value || '');
      return !!raw.trim() && moduleMarkerPattern.test(raw) && isEffectivelyEmpty(raw);
    };
    const isLightBoardStructuredPrompt = value => {
      const raw = text(value || '').trim();
      if (!raw) return false;
      const lower = raw.toLowerCase();
      const formatHits = lightBoardStructuredFormatMarkers.filter(marker => lower.includes(text(marker).toLowerCase())).length;
      const guidanceHits = lightBoardStructuredGuidanceMarkers.filter(marker => lower.includes(text(marker).toLowerCase())).length;
      if (formatHits >= 2 && guidanceHits >= 1) return true;
      return formatHits >= 3;
    };
    const isHardAuxiliaryPrompt = value => {
      const raw = text(value || '');
      if (!raw.trim()) return false;
      if (hardAuxiliaryMarkerPattern.test(raw)) return true;
      if (isLightBoardStructuredPrompt(raw)) return true;
      if (structuredImagePromptPattern.test(raw)) return true;
      if (structuredTranslationPromptPattern.test(raw)) return true;
      return false;
    };
    return Object.freeze({ isModuleOnlyPrompt, isHardAuxiliaryPrompt });
  })();

  const latestSgaProvenanceUserTurn = (messages) => {
    const source = Array.isArray(messages) ? messages : [];
    for (let i = source.length - 1; i >= 0; i -= 1) {
      const message = source[i];
      const role = currentTurnRole(message);
      if (role && !/user|human/i.test(role)) continue;
      if (!hasSgaChatProvenance(message)) continue;
      const rawBody = rawCurrentTurnBody(message);
      const wrapped = currentInputFrom(rawBody);
      const stripped = compact(wrapped || rawBody, 6000);
      if (!stripped || isBackstageUserPayload(rawBody) || isExternalMemoryInjectionPayload(rawBody)) continue;
      return {
        text: stripped,
        requestIndex: i,
        requestEndIndex: i,
        source: wrapped ? 'request_provenance_wrapper' : 'request_provenance_user',
        confidence: 'request_provenance',
        tag: '',
        message
      };
    }
    return null;
  };

  const resolveSgaCurrentTurn = (messages = []) => {
    const source = Array.isArray(messages) ? messages : [];
    const terminalPrefillIndex = findSgaTerminalAssistantPrefillIndex(source);
    const currentRange = latestSgaCurrentInputRange(source);
    const provenanceTurn = latestSgaProvenanceUserTurn(source);

    // HAYAKU 2.0 precedence: later provenance beats an older wrapper, and an
    // unrendered wrapper cannot displace a provenance-bearing user message.
    if (provenanceTurn && (
      !currentRange?.text
      || provenanceTurn.requestIndex > Number(currentRange.end ?? currentRange.start ?? -1)
      || hasUnresolvedPromptTemplate(currentRange.text)
    )) {
      return { ...provenanceTurn, terminalPrefillIndex };
    }

    if (currentRange?.text) {
      return {
        text: compact(currentRange.text, 6000),
        requestIndex: currentRange.start,
        requestEndIndex: currentRange.end,
        source: 'explicit_wrapper',
        confidence: 'explicit_wrapper',
        tag: currentRange.tag || '',
        terminalPrefillIndex,
        message: source[currentRange.start] || null
      };
    }

    // Same-message inline-wrapper fallback retained from HAYAKU 2.0.
    for (let i = source.length - 1; i >= 0; i -= 1) {
      const message = source[i];
      const role = currentTurnRole(message);
      if (role && !/user|human/i.test(role)) continue;
      const current = currentInputFrom(rawCurrentTurnBody(message));
      if (!current) continue;
      return {
        text: compact(current, 6000),
        requestIndex: i,
        requestEndIndex: i,
        source: 'inline_wrapper',
        confidence: 'explicit_wrapper',
        tag: '',
        terminalPrefillIndex,
        message
      };
    }

    if (provenanceTurn) return { ...provenanceTurn, terminalPrefillIndex };

    const hasAnyProvenance = source.some(hasSgaChatProvenance);
    const legacyLimit = terminalPrefillIndex >= 0 ? terminalPrefillIndex - 1 : source.length - 1;
    const legacyCandidates = [];
    for (let i = legacyLimit; i >= 0; i -= 1) {
      const message = source[i];
      const role = currentTurnRole(message);
      if (role && !/user|human/i.test(role)) continue;
      const rawBody = rawCurrentTurnBody(message);
      const stripped = compact(rawBody, 6000);
      if (!stripped || isBackstageUserPayload(rawBody) || isExternalMemoryInjectionPayload(rawBody)) continue;
      if (SgaCurrentInputRequestKind.isModuleOnlyPrompt(stripped) || SgaCurrentInputRequestKind.isHardAuxiliaryPrompt(stripped)) continue;
      legacyCandidates.push({ index: i, text: stripped, message });
      if (legacyCandidates.length >= 2) break;
    }

    const allowLegacyTailFallback = !hasAnyProvenance && terminalPrefillIndex < 0 && legacyCandidates.length > 0;
    if (legacyCandidates.length === 1 || allowLegacyTailFallback) {
      const selected = legacyCandidates[0];
      return {
        text: selected.text,
        requestIndex: selected.index,
        requestEndIndex: selected.index,
        source: legacyCandidates.length === 1 ? 'unique_legacy_user' : 'legacy_last_safe_user',
        confidence: legacyCandidates.length === 1 ? 'legacy_unique' : 'legacy_ambiguous',
        tag: '',
        terminalPrefillIndex,
        message: selected.message
      };
    }

    return {
      text: '',
      requestIndex: -1,
      requestEndIndex: -1,
      source: 'none',
      confidence: 'none',
      tag: '',
      terminalPrefillIndex,
      message: null
    };
  };

  const extractLatestUserInput = messages => resolveSgaCurrentTurn(messages).text || '';

  const extractSceneAnchorFromAssistant = (content) => {
    const src = text(content || '');
    const formats = [
      /\[[^\n\[\]]{0,40}\|[^\n\[\]]{0,80}\|[^\n\[\]]{0,120}\|[^\n\[\]]{0,180}\]/g,
      /(?:\*\*|##)\s*(?:Location|장소|위치|Scene|장면|Setting|배경)\s*:?\s*\*?\*?\s*([^\n]{1,200})/gi,
      /(?:^|\n)\s*(?:📍|🗺️|🏠|📂)\s*([^\n]{1,200})/g,
      /(?:^|\n)\s*(?:Location|장소|Time|시간|Date|날짜|Weather|날씨|Mood|분위기)\s*:\s*([^\n]{1,180})/gi
    ];
    let last = '';
    for (const regex of formats) {
      const matches = [...src.matchAll(regex)];
      if (matches.length) {
        const match = matches[matches.length - 1];
        last = match[1] ? match[1].trim() : match[0];
      }
    }
    if (!last) {
      const statusBlock = src.match(/(?:^|\n)###\s*Status[\s\S]*?(?=\n###|\n##|\n# |$)/i);
      if (statusBlock) last = compact(statusBlock[0].replace(/^###\s*Status/i, '').trim(), 600);
    }
    return compact(last, 600);
  };

  const formatMessageWindow = (messages, maxEach = 2200, maxTotal = 18000) => {
    const formatted = (messages || []).map((m, i) => {
      const label = m.name ? `${m.role}:${m.name}` : m.role;
      return `#${i + 1} <${label}>\n${compact(m.content, maxEach)}`;
    }).join('\n\n---\n\n');
    return compact(formatted, maxTotal);
  };


  const buildRecentChat = (messages, settings) => {
    const normalized = normalizeMessages(messages);
    const allowed = normalized
      .filter(m => ['system', 'user', 'assistant', 'developer'].includes(m.role))
      .filter(m => !isSgaInjectionText(m.content));
    const systemContextMessages = allowed.filter(m => ['system', 'developer'].includes(m.role));
    const otherInfoMessages = allowed.filter(m => {
      if (['system', 'developer'].includes(m.role)) return false;
      return isOthersInfoMessage(m.content) || (m.role === 'user' && isLikelyMetaUserMessage(m.content));
    });
    const visibleChatMessages = allowed.filter(m => {
      if (!['user', 'assistant'].includes(m.role)) return false;
      if (m.role === 'user' && (isLikelyMetaUserMessage(m.content) || isOthersInfoMessage(m.content))) return false;
      return true;
    });
    const maxMessages = Math.max(6, settings.turnWindow * 2 + 4);
    const sliced = allowed.slice(-maxMessages);
    const visibleSliced = visibleChatMessages.slice(-maxMessages);
    const systemSliced = systemContextMessages.slice(-6);
    const otherSliced = otherInfoMessages.slice(-8);
    const currentTurnResolution = settings?.currentTurnResolution?.text
      ? settings.currentTurnResolution
      : resolveSgaCurrentTurn(messages);
    const latestUser = currentTurnResolution.text || '';
    const latestAssistant = [...normalized].reverse().find(m => m.role === 'assistant' && !isSgaInjectionText(m.content))?.content || '';
    const sceneAnchor = extractSceneAnchorFromAssistant(latestAssistant);
    const visibleMessages = visibleSliced.map((m, idx) => ({
      role: m.role,
      name: m.name || '',
      index: m.index,
      source: `message ${idx + 1} by ${m.role}`,
      content: compact(m.content, 4000)
    }));
    return {
      latestUser: compact(latestUser, 6000),
      currentTurnResolution: {
        source: currentTurnResolution.source || 'none',
        confidence: currentTurnResolution.confidence || 'none',
        requestIndex: Number.isInteger(currentTurnResolution.requestIndex) ? currentTurnResolution.requestIndex : -1,
        requestEndIndex: Number.isInteger(currentTurnResolution.requestEndIndex) ? currentTurnResolution.requestEndIndex : -1,
        tag: currentTurnResolution.tag || ''
      },
      latestAssistant: compact(latestAssistant, 4000),
      sceneAnchor,
      text: formatMessageWindow(sliced, 2200, settings.maxRecentChars),
      visibleText: formatMessageWindow(visibleSliced, 2200, settings.maxRecentChars),
      systemContext: formatMessageWindow(systemSliced, 1800, 7000),
      othersInfo: formatMessageWindow(otherSliced, 1800, 9000),
      visibleMessages,
      loreSearchMessages: visibleMessages.map((m, idx) => ({
        source: m.name ? `message ${idx + 1} by ${m.role}:${m.name}` : `message ${idx + 1} by ${m.role}`,
        role: m.role,
        prompt: `\x01{{${m.name || m.role}}}:${m.content}\x01`,
        data: m.content
      })),
      messageCount: normalized.length,
      filteredMessageCount: allowed.length,
      visibleMessageCount: visibleChatMessages.length,
      othersInfoCount: otherInfoMessages.length
    };
  };


  const firstFilled = (...values) => {
    for (const value of values) {
      const body = text(value || '').trim();
      if (body) return body;
    }
    return '';
  };

  const normalizeForLoreMatch = (value) => text(value || '')
    .toLocaleLowerCase()
    .replace(/\{\{\/\/[\s\S]*?\}\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const splitLoreKeys = (value) => {
    if (Array.isArray(value)) return value.flatMap(item => splitLoreKeys(item));
    if (value && typeof value === 'object') return Object.values(value).flatMap(item => splitLoreKeys(item));
    return text(value || '').split(/[,;\n]/).map(key => key.trim()).filter(Boolean);
  };

  const collectionFrom = (value, source = '') => {
    if (Array.isArray(value)) return value
      .map((item, index) => item && typeof item === 'object' ? { ...item, __collectionKey: text(item.__collectionKey || index), __collectionSource: source } : null)
      .filter(Boolean);
    if (value && typeof value === 'object') {
      return Object.entries(value)
        .map(([key, item]) => item && typeof item === 'object' ? { ...item, __collectionKey: key, __collectionSource: source } : null)
        .filter(Boolean);
    }
    return [];
  };

  const identityValues = (value) => {
    if (!value || typeof value !== 'object') return [];
    return [
      value.id, value._id, value.uid, value.uuid, value.key, value.name,
      value.displayName, value.nickname, value.namespace, value.slug,
      value.__collectionKey
    ].map(item => text(item || '').trim()).filter(Boolean);
  };

  const sameIdentity = (item, selector) => {
    if (!item || selector == null || selector === '') return false;
    if (item === selector) return true;
    const ids = identityValues(item);
    if (selector && typeof selector === 'object') {
      const selectorIds = identityValues(selector);
      if (selectorIds.some(id => ids.includes(id))) return true;
      try {
        return JSON.stringify(item) === JSON.stringify(selector);
      } catch (_) {
        return false;
      }
    }
    const raw = text(selector).trim();
    return !!raw && ids.includes(raw);
  };

  const makeLoreRegex = (pattern) => {
    const raw = text(pattern || '').trim();
    if (!raw.startsWith('/')) return null;
    const lastSlash = raw.lastIndexOf('/');
    if (lastSlash <= 0) return null;
    try { return new RegExp(raw.slice(1, lastSlash), raw.slice(lastSlash + 1)); } catch (_) { return null; }
  };

  const loreContent = lore => firstFilled(lore?.content, lore?.prompt, lore?.text, lore?.entry, lore?.data, lore?.value, lore?.body);

  const isLibraManagedLore = (lore) => {
    if (!lore || typeof lore !== 'object') return false;
    const comment = text(lore.comment || '').trim();
    const key = text(lore.key || lore.id || lore.keys || '').trim();
    const memo = text(lore.memo || '').trim();
    const content = loreContent(lore);
    return /^LIBRA_CONTAINER$/i.test(memo)
      || /^LIBRA_DATA_/i.test(key)
      || /^lmai(?:_|$|::|-)/i.test(comment)
      || /^lmai(?:_|$|::|-)/i.test(key)
      || /"memo"\s*:\s*"LIBRA_CONTAINER"/i.test(content)
      || (/"category"\s*:\s*"lmai_/i.test(content) && /"entries"\s*:/i.test(content));
  };

  const currentChatFromCharacter = (character) => {
    const chats = Array.isArray(character?.chats) ? character.chats : [];
    if (!chats.length) return null;
    const page = Number.isInteger(character?.chatPage) ? character.chatPage : 0;
    return chats[page] || chats[0] || null;
  };

  const safeApi = async (label, fn, debugLog = false) => {
    try { return await fn(); }
    catch (error) {
      if (debugLog) warn(`${label}_unavailable`, error);
      return null;
    }
  };

  const loadCurrentCharacterForRisuContext = async (debugLog = false) => {
    const direct = typeof API.getCharacter === 'function' ? await safeApi('getCharacter', () => API.getCharacter(), debugLog) : null;
    if (direct) return { character: direct, source: 'getCharacter' };
    if (typeof API.getCurrentCharacterIndex === 'function' && typeof API.getCharacterFromIndex === 'function') {
      const charIndex = await safeApi('getCurrentCharacterIndex', () => API.getCurrentCharacterIndex(), debugLog);
      if (Number.isFinite(Number(charIndex))) {
        const byIndex = await safeApi('getCharacterFromIndex', () => API.getCharacterFromIndex(parseInt(charIndex, 10)), debugLog);
        if (byIndex) return { character: byIndex, source: 'getCharacterFromIndex' };
      }
    }
    return { character: null, source: 'missing' };
  };

  const loadCurrentChatForRisuContext = async (character, debugLog = false) => {
    const fallback = currentChatFromCharacter(character);
    const out = { chat: fallback, source: fallback ? 'character.chats' : 'missing', error: '' };
    if (typeof API.getCurrentCharacterIndex !== 'function' || typeof API.getCurrentChatIndex !== 'function' || typeof API.getChatFromIndex !== 'function') return out;
    const charIndex = await safeApi('getCurrentCharacterIndex', () => API.getCurrentCharacterIndex(), debugLog);
    const chatIndex = await safeApi('getCurrentChatIndex', () => API.getCurrentChatIndex(), debugLog);
    if (!Number.isFinite(Number(charIndex)) || !Number.isFinite(Number(chatIndex))) return out;
    const chat = await safeApi('getChatFromIndex', () => API.getChatFromIndex(parseInt(charIndex, 10), parseInt(chatIndex, 10)), debugLog);
    if (chat) return { chat, source: 'getChatFromIndex', error: '' };
    return out;
  };

  const personaLooksUsable = (persona) => !!persona && typeof persona === 'object' && !!firstFilled(
    persona.personaPrompt, persona.persona, persona.description, persona.desc,
    persona.prompt, persona.content, persona.text, persona.name, persona.id
  );

  const selectedPersonaFromDb = (db, currentChat = null) => {
    const personas = collectionFrom(db?.personas, 'personas');
    if (!personas.length) return null;
    const selectors = [
      ['chat.bindedPersona', currentChat?.bindedPersona],
      ['chat.boundPersona', currentChat?.boundPersona],
      ['chat.personaId', currentChat?.personaId],
      ['chat.selectedPersona', currentChat?.selectedPersona],
      ['chat.persona', currentChat?.persona],
      ['database.selectedPersona', db?.selectedPersona]
    ];
    for (const [source, selector] of selectors) {
      if (selector == null || selector === '') continue;
      if (Number.isInteger(selector) && personas[selector]) return { ...personas[selector], __source: `${source}:index` };
      const numeric = Number.parseInt(text(selector), 10);
      if (/^\d+$/.test(text(selector).trim()) && personas[numeric]) return { ...personas[numeric], __source: `${source}:index` };
      const matched = personas.find(p => sameIdentity(p, selector));
      if (matched) return { ...matched, __source: `${source}:id` };
      if (personaLooksUsable(selector)) return { ...selector, __source: `${source}:object` };
    }
    return { ...personas[0], __source: 'personas[0]' };
  };

  const parseLoreDecoratorArgs = (raw = '') => text(raw || '')
    .split('::')
    .flatMap(part => part.split(','))
    .map(part => part.trim())
    .filter(Boolean);

  const parseRisuLoreDecorators = (content) => {
    const meta = {
      position: '',
      depth: 0,
      role: 'system',
      scanDepth: null,
      priority: null,
      additionalKeys: [],
      excludeKeys: [],
      excludeKeysAll: [],
      fullWordMatching: null,
      recursive: null,
      dontSearchWhenRecursive: false,
      forceState: 'none',
      activationMin: 0,
      activationEvery: 0,
      inject: null,
      ignoreOnMaxContext: false
    };
    const body = text(content || '').replace(/\{\{\s*([a-zA-Z_][\w-]*)(?:::([^{}]*))?\s*\}\}/g, (match, rawName, rawArgs = '') => {
      const name = text(rawName).trim().toLowerCase();
      const args = parseLoreDecoratorArgs(rawArgs);
      const intArg = (fallback = 0) => {
        const n = Number.parseInt(args[0], 10);
        return Number.isFinite(n) ? n : fallback;
      };
      switch (name) {
        case 'end':
          meta.position = 'depth';
          meta.depth = 0;
          return '';
        case 'depth':
        case 'reverse_depth':
          meta.position = name;
          meta.depth = intArg(0);
          return '';
        case 'role':
          if (['system', 'user', 'assistant'].includes(args[0])) meta.role = args[0];
          return '';
        case 'scan_depth':
          meta.scanDepth = intArg(null);
          return '';
        case 'position':
          meta.position = compact(args.join(' '), 80);
          return '';
        case 'additional_keys':
          meta.additionalKeys.push(...splitLoreKeys(args));
          return '';
        case 'exclude_keys':
          meta.excludeKeys.push(...splitLoreKeys(args));
          return '';
        case 'exclude_keys_all':
          meta.excludeKeysAll.push(...splitLoreKeys(args));
          return '';
        case 'match_full_word':
          meta.fullWordMatching = true;
          return '';
        case 'match_partial_word':
          meta.fullWordMatching = false;
          return '';
        case 'activate':
          meta.forceState = 'activate';
          return '';
        case 'dont_activate':
          meta.forceState = 'deactivate';
          return '';
        case 'priority':
          meta.priority = intArg(null);
          return '';
        case 'ignore_on_max_context':
          meta.ignoreOnMaxContext = true;
          meta.priority = -1000;
          return '';
        case 'recursive':
          meta.recursive = true;
          return '';
        case 'unrecursive':
          meta.recursive = false;
          return '';
        case 'no_recursive_search':
          meta.dontSearchWhenRecursive = true;
          return '';
        case 'activate_only_after':
          meta.activationMin = intArg(0);
          return '';
        case 'activate_only_every':
          meta.activationEvery = intArg(0);
          return '';
        case 'inject_lore':
          meta.inject = { operation: meta.inject?.operation || 'append', location: args.join(' '), param: meta.inject?.param || '', lore: true };
          return '';
        case 'inject_at':
          meta.inject = { operation: meta.inject?.operation || 'append', location: args.join(' '), param: meta.inject?.param || '', lore: false };
          return '';
        case 'inject_replace':
          meta.inject = { operation: 'replace', location: meta.inject?.location || '', param: args.join(' '), lore: meta.inject?.lore || false };
          return '';
        case 'inject_prepend':
          meta.inject = { operation: 'prepend', location: meta.inject?.location || '', param: args.join(' '), lore: meta.inject?.lore || false };
          return '';
        case 'probability':
          if (Math.random() * 100 > intArg(100)) meta.forceState = 'deactivate';
          return '';
        default:
          return match;
      }
    }).replace(/\{\{\/\/[\s\S]*?\}\}/g, '').replace(/\{\{comment:[\s\S]*?\}\}/gi, '').trim();
    meta.content = body;
    return meta;
  };

  const normalizeLoreCandidate = (lore, label, sourceType, sourceOrder, index) => {
    const content = loreContent(lore);
    const decorator = parseRisuLoreDecorators(content);
    const keys = splitLoreKeys([lore?.key, lore?.keys, lore?.keywords, lore?.primaryKeys, lore?.matchKeys]);
    const secondaryKeys = splitLoreKeys([lore?.secondkey, lore?.secondKey, lore?.secondary_keys, lore?.secondaryKeys, lore?.additionalKeys]);
    const insertorder = Number.isFinite(Number(lore?.insertorder ?? lore?.order ?? lore?.priority)) ? Number(lore?.insertorder ?? lore?.order ?? lore?.priority) : 100;
    return {
      id: text(lore?.id || `${sourceType}-${sourceOrder}-${index}`),
      label: firstFilled(lore?.comment, lore?.name, lore?.displayName, label, '로어북'),
      source: label,
      sourceType,
      content: decorator.content || content,
      rawContent: content,
      key: keys.join(', '),
      keys,
      secondaryKeys,
      additionalKeys: decorator.additionalKeys,
      excludeKeys: decorator.excludeKeys,
      excludeKeysAll: decorator.excludeKeysAll,
      useRegex: lore?.useRegex === true || lore?.regex === true,
      alwaysActive: lore?.alwaysActive === true || lore?.always_active === true || lore?.constant === true || lore?.forceActivation === true || lore?.force_activation === true || text(lore?.mode).toLowerCase() === 'constant',
      mode: text(lore?.mode || 'normal').toLowerCase(),
      insertorder,
      priority: Number.isFinite(Number(decorator.priority)) ? Number(decorator.priority) : insertorder,
      scanDepth: Number.isFinite(Number(decorator.scanDepth)) ? Number(decorator.scanDepth) : null,
      position: decorator.position || '',
      depth: decorator.depth || 0,
      role: decorator.role || 'system',
      selective: lore?.selective === true,
      fullWordMatching: decorator.fullWordMatching,
      recursive: decorator.recursive,
      dontSearchWhenRecursive: !!decorator.dontSearchWhenRecursive,
      forceState: decorator.forceState || 'none',
      activationMin: decorator.activationMin || 0,
      activationEvery: decorator.activationEvery || 0,
      inject: decorator.inject,
      originalIndex: index
    };
  };

  const isLoreDisabled = (lore) => lore?.enabled === false
    || lore?.disabled === true
    || lore?.disable === true
    || lore?.isDisabled === true
    || text(lore?.mode || '').toLowerCase() === 'disabled';

  const addLoreCollection = (add, value, label, sourceType, sourceOrderBase = 0) => {
    if (value && typeof value === 'object' && loreContent(value)) {
      add(value, label, sourceType, sourceOrderBase);
      return;
    }
    collectionFrom(value, label).forEach((lore, idx) => add(lore, label, sourceType, sourceOrderBase + idx));
  };

  const enabledModuleReferenceSet = (db) => {
    const refs = new Set();
    const add = value => {
      const raw = text(value || '').trim();
      if (raw) refs.add(raw);
    };
    const visit = (value) => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'object') identityValues(item).forEach(add);
          else add(item);
        });
      } else if (value && typeof value === 'object') {
        for (const [key, item] of Object.entries(value)) {
          if (item === true || item === 'true' || item === 1) add(key);
          else if (item && typeof item === 'object' && item.enabled !== false && item.disabled !== true) {
            add(key);
            identityValues(item).forEach(add);
          }
        }
      } else add(value);
    };
    visit(db?.enabledModules);
    visit(db?.moduleIntergration);
    visit(db?.moduleIntegration);
    return refs;
  };

  const moduleIsEnabled = (module, enabledRefs) => {
    if (!module || typeof module !== 'object') return false;
    if (module.enabled === false || module.disabled === true || module.disable === true) return false;
    if (!enabledRefs.size) return module.enabled === true || module.active === true || module.isEnabled === true || module.disabled !== true;
    return identityValues(module).some(id => enabledRefs.has(id));
  };

  const collectRisuLorebookCandidates = (character, db, currentChat = null) => {
    const candidates = [];
    const seen = new Set();
    const add = (lore, label, sourceType, sourceOrder = 0) => {
      if (!lore || isLoreDisabled(lore) || isLibraManagedLore(lore)) return;
      const content = loreContent(lore);
      if (!content) return;
      const dedupe = normalizeForLoreMatch(`${sourceType}\n${firstFilled(lore.comment, lore.name, label)}\n${firstFilled(lore.key, lore.keys, lore.keywords)}\n${content}`);
      if (seen.has(dedupe)) return;
      seen.add(dedupe);
      candidates.push(normalizeLoreCandidate(lore, label, sourceType, sourceOrder, candidates.length));
    };
    const characterSources = [
      character?.globalLore, character?.lore, character?.lorebook, character?.loreBook, character?.lorebooks,
      character?.characterBook?.entries, character?.character_book?.entries,
      character?.data?.characterBook?.entries, character?.data?.character_book?.entries,
      character?.extensions?.characterBook?.entries, character?.extensions?.character_book?.entries,
      character?.data?.extensions?.characterBook?.entries, character?.data?.extensions?.character_book?.entries
    ];
    characterSources.forEach((source, idx) => addLoreCollection(add, source, '캐릭터 로어북', 'character', idx * 1000));

    const chatSources = [
      currentChat?.localLore, currentChat?.globalLore, currentChat?.lore, currentChat?.lorebook, currentChat?.loreBook, currentChat?.lorebooks,
      currentChat?.characterBook?.entries, currentChat?.character_book?.entries,
      currentChat?.data?.characterBook?.entries, currentChat?.data?.character_book?.entries,
      currentChat?.extensions?.characterBook?.entries, currentChat?.extensions?.character_book?.entries
    ];
    chatSources.forEach((source, idx) => addLoreCollection(add, source, '채팅 로어북', 'chat', idx * 1000));

    const enabledRefs = enabledModuleReferenceSet(db);
    for (const module of collectionFrom(db?.modules, 'modules')) {
      if (!moduleIsEnabled(module, enabledRefs)) continue;
      const moduleLabel = `모듈 로어북: ${firstFilled(module?.name, module?.displayName, module?.id, module?.namespace, 'unknown')}`;
      [
        module?.lore, module?.lorebook, module?.loreBook, module?.lorebooks, module?.entries,
        module?.data?.lore, module?.data?.lorebook, module?.data?.loreBook, module?.data?.lorebooks,
        module?.data?.characterBook?.entries, module?.data?.character_book?.entries,
        module?.extensions?.characterBook?.entries, module?.extensions?.character_book?.entries
      ].forEach((source, idx) => addLoreCollection(add, source, moduleLabel, 'module', idx * 1000));
    }
    return candidates;
  };

  const stripLoreDecorators = (content) => parseRisuLoreDecorators(content).content || text(content || '').trim();

  const loreSearchableMessage = (message) => {
    const data = normalizeForLoreMatch(message?.data || message?.content || '');
    const prompt = normalizeForLoreMatch(message?.prompt || message?.data || message?.content || '');
    return {
      source: message?.source || 'message',
      data,
      prompt,
      compactData: data.replace(/ /g, ''),
      splitWords: new Set(data.split(/\s+/).filter(Boolean))
    };
  };

  const loreKeyMatchesSearchMessages = (keys, messages, options = {}) => {
    const cleanKeys = splitLoreKeys(keys).map(key => key.trim()).filter(Boolean);
    if (!cleanKeys.length) return false;
    const fullWord = options.fullWordMatching === true;
    const useRegex = options.useRegex === true;
    const all = options.all === true;
    let allMatched = true;
    for (const key of cleanKeys) {
      if (!key) continue;
      let matched = false;
      for (const message of messages) {
        if (useRegex || /^\/.+\/[a-z]*$/i.test(key)) {
          const regex = makeLoreRegex(key);
          if (regex) {
            regex.lastIndex = 0;
            matched = regex.test(message.data);
          }
        } else if (fullWord) {
          matched = message.splitWords.has(normalizeForLoreMatch(key));
        } else {
          const normalizedKey = normalizeForLoreMatch(key);
          matched = message.compactData.includes(normalizedKey.replace(/ /g, ''))
            || message.data.includes(normalizedKey)
            || message.prompt.includes(normalizedKey);
        }
        if (matched) break;
      }
      if (matched && !all) return true;
      if (!matched) allMatched = false;
    }
    return all ? allMatched : false;
  };

  const loreKeyMatches = (candidate, haystack) => {
    if (candidate.alwaysActive) return true;
    if (candidate.mode === 'folder') return false;
    const keys = candidate.keys.length ? candidate.keys : candidate.secondaryKeys;
    if (!keys.length) return false;
    for (const key of keys) {
      if (!key) continue;
      if (candidate.useRegex || /^\/.+\/[a-z]*$/i.test(key)) {
        const regex = makeLoreRegex(key);
        if (regex) {
          regex.lastIndex = 0;
          if (regex.test(haystack)) return true;
        }
      } else if (haystack.includes(normalizeForLoreMatch(key).replace(/ /g, ''))) {
        return true;
      } else if (normalizeForLoreMatch(haystack).includes(normalizeForLoreMatch(key))) {
        return true;
      }
    }
    return false;
  };

  const activeRisuLorebooks = (recent, candidates, settings = {}) => {
    const baseMessages = Array.isArray(recent?.loreSearchMessages) && recent.loreSearchMessages.length
      ? recent.loreSearchMessages
      : [{ source: 'recent chat', data: `${recent?.latestUser || ''}\n${recent?.latestAssistant || ''}\n${recent?.text || ''}` }];
    const baseSearchMessages = baseMessages.map(loreSearchableMessage);
    const recursiveSearchMessages = [];
    const active = [];
    const activated = new Set();
    const chatLength = Math.max(1, Number(recent?.visibleMessageCount || baseSearchMessages.length || 1));
    const defaultScanDepth = clampInt(settings?.loreBookDepth || settings?.turnWindow || DEFAULT_RECENT_TURNS, 1, 64, DEFAULT_RECENT_TURNS);
    const tokenBudget = clampInt(
      settings?.loreBookToken || Math.ceil((settings?.shadowRisuContextMaxChars || DEFAULT_SHADOW_RISU_CONTEXT_CHARS) / 3.4),
      64,
      80000,
      Math.ceil(DEFAULT_SHADOW_RISU_CONTEXT_CHARS / 3.4)
    );
    let matching = true;
    let guard = 0;
    while (matching && guard < 12) {
      matching = false;
      guard += 1;
      for (let i = 0; i < (candidates || []).length; i += 1) {
        const candidate = candidates[i];
        if (!candidate || activated.has(i) || candidate.mode === 'folder') continue;
        if (candidate.activationMin && chatLength < candidate.activationMin) continue;
        if (candidate.activationEvery && chatLength % candidate.activationEvery !== 0) continue;
        if (candidate.forceState === 'deactivate') continue;
        const scanDepth = clampInt(candidate.scanDepth || defaultScanDepth, 1, 128, defaultScanDepth);
        const searchMessages = baseSearchMessages.slice(-scanDepth).concat(candidate.dontSearchWhenRecursive ? [] : recursiveSearchMessages);
        let isActive = candidate.forceState === 'activate' || candidate.alwaysActive;
        if (!isActive) {
          const queries = [];
          if (candidate.keys?.length) queries.push({ keys: candidate.keys, negative: false });
          if (candidate.secondaryKeys?.length && candidate.selective) queries.push({ keys: candidate.secondaryKeys, negative: false });
          if (candidate.additionalKeys?.length) queries.push({ keys: candidate.additionalKeys, negative: false });
          if (candidate.excludeKeys?.length) queries.push({ keys: candidate.excludeKeys, negative: true });
          if (candidate.excludeKeysAll?.length) queries.push({ keys: candidate.excludeKeysAll, negative: true, all: true });
          if (!queries.length) isActive = false;
          else {
            isActive = true;
            for (const query of queries) {
              const matched = loreKeyMatchesSearchMessages(query.keys, searchMessages, {
                useRegex: candidate.useRegex,
                fullWordMatching: candidate.fullWordMatching,
                all: query.all
              });
              if (query.negative ? matched : !matched) {
                isActive = false;
                break;
              }
            }
          }
        }
        if (!isActive) continue;
        const prompt = stripLoreDecorators(candidate.content);
        if (!prompt) continue;
        const matchable = { ...candidate, content: prompt, prompt, tokens: estimateTokensFromText(prompt) };
        active.push(matchable);
        activated.add(i);
        const recursive = candidate.recursive == null ? true : candidate.recursive;
        if (recursive) {
          recursiveSearchMessages.push(loreSearchableMessage({
            source: `lorebook ${candidate.label}`,
            prompt,
            data: prompt
          }));
          matching = true;
        }
      }
    }

    let usedTokens = 0;
    const byPriority = active
      .sort((a, b) => (b.priority - a.priority) || (a.originalIndex - b.originalIndex))
      .filter(item => {
        if (usedTokens + item.tokens <= tokenBudget) {
          usedTokens += item.tokens;
          return true;
        }
        return false;
      })
      .sort((a, b) => (b.insertorder - a.insertorder) || (a.originalIndex - b.originalIndex));

    const injectLores = byPriority.filter(item => item.inject?.lore);
    const normal = byPriority.filter(item => !item.inject?.lore);
    for (const lore of injectLores) {
      const target = normal.find(item => item.source === lore.inject.location || item.label === lore.inject.location);
      if (!target) continue;
      if (lore.inject.operation === 'prepend') target.content = `${lore.content} ${target.content}`.trim();
      else if (lore.inject.operation === 'replace') target.content = target.content.replace(lore.inject.param, lore.content);
      else target.content = `${target.content} ${lore.content}`.trim();
    }
    return normal.reverse();
  };

  const formatPersonaForShadow = (persona) => {
    if (!persona) return '(선택된 페르소나 없음 또는 접근 불가)';
    const name = firstFilled(persona.name, persona.id, 'Unnamed Persona');
    const prompt = firstFilled(persona.personaPrompt, persona.persona, persona.description, persona.desc, persona.prompt, persona.content, persona.text);
    return [`이름/식별자: ${name}`, persona.__source ? `출처: ${persona.__source}` : '', prompt ? `내용:\n${compact(prompt, 3000)}` : '내용 없음'].filter(Boolean).join('\n');
  };

  const formatRisuMemorySnapshot = (currentChat, maxChars = 7000) => {
    if (!currentChat || typeof currentChat !== 'object') return '';
    const fields = [
      ['supaMemoryData', currentChat.supaMemoryData],
      ['hypaMemoryData', currentChat.hypaMemoryData],
      ['hypaV2Data', currentChat.hypaV2Data],
      ['hypaV3Data', currentChat.hypaV3Data],
      ['lastMemory', currentChat.lastMemory],
      ['memory', currentChat.memory],
      ['memories', currentChat.memories],
      ['summary', currentChat.summary],
      ['note', currentChat.note]
    ];
    const blocks = [];
    for (const [label, value] of fields) {
      if (value == null || value === '') continue;
      const body = typeof value === 'string' ? value : compact(JSON.stringify(value, null, 2), Math.floor(maxChars / 2));
      if (body.trim()) blocks.push(`[${label}]\n${body}`);
    }
    return compact(blocks.join('\n\n'), maxChars);
  };

  const loadRisuContextSnapshot = async (settings) => {
    const characterInfo = await loadCurrentCharacterForRisuContext(settings.debugLog);
    const character = characterInfo.character;
    const db = typeof API.getDatabase === 'function'
      ? await safeApi('getDatabase', () => API.getDatabase(['personas', 'selectedPersona', 'modules', 'enabledModules', 'moduleIntergration', 'moduleIntegration', 'globalChatVariables']), settings.debugLog)
      : null;
    const chatInfo = await loadCurrentChatForRisuContext(character, settings.debugLog);
    const persona = selectedPersonaFromDb(db, chatInfo.chat);
    const candidates = collectRisuLorebookCandidates(character, db, chatInfo.chat);
    return { characterInfo, character, db, chatInfo, persona, candidates };
  };

  const formatShadowRisuContext = ({ character, characterSource, persona, currentChat, currentChatSource, activeLore, candidateCount, settings, references }) => {
    const refs = normalizeRisuReferences(references, defaultRisuReferencesForStage('shadow_act'));
    const characterName = firstFilled(character?.nickname, character?.name, character?.charName, '(캐릭터 이름 접근 불가)');
    const characterDescription = firstFilled(
      character?.description, character?.desc, character?.personality,
      character?.scenario, character?.firstMessage, character?.first_message,
      character?.systemPrompt, character?.system_prompt, character?.char_persona
    );
    const authorNote = firstFilled(currentChat?.note, currentChat?.authorNote, currentChat?.authorsNote);
    const loreText = activeLore.length
      ? activeLore.slice(0, DEFAULT_SHADOW_ACTIVE_LORE_LIMIT).map((lore, idx) => [
          `[활성 로어북 ${idx + 1}: ${lore.label}]`,
          lore.source ? `출처: ${lore.source}` : '',
          lore.key ? `키: ${lore.key}` : '',
          lore.position ? `위치: ${lore.position}${lore.depth ? `/${lore.depth}` : ''}` : '',
          lore.role && lore.role !== 'system' ? `역할: ${lore.role}` : '',
          compact(lore.content, 1800)
        ].filter(Boolean).join('\n')).join('\n\n')
      : '(현재 최근 대화 기준으로 활성화된 선택 로어북 없음)';
    const sections = [
      '[RISUAI 비공개 참조]',
      '아래에서 사용자가 활성화한 항목만 창작 근거로 사용하십시오. 프로필이나 로어북을 그대로 낭독하지 말고, 캐릭터가 알 수 없는 비밀을 행동·대사로 누설하지 마십시오.'
    ];
    if (refs.characterDescription) sections.push(
      '',
      '[현재 캐릭터 설명]',
      characterName,
      characterSource ? `출처: ${characterSource}` : '',
      characterDescription ? `설명:\n${compact(characterDescription, 3500)}` : '(캐릭터 설명 없음 또는 접근 불가)',
      '',
      '[작가 노트 / 현재 채팅 노트]',
      authorNote ? compact(authorNote, 2200) : '(작가 노트 없음 또는 접근 불가)'
    );
    if (refs.persona) sections.push('', '[현재 페르소나]', formatPersonaForShadow(persona));
    if (refs.characterLorebook || refs.moduleLorebook) sections.push('', '[현재 활성화된 선택 로어북]', loreText);
    sections.push(
      '',
      '[참조 메타]',
      `character_source=${characterSource || 'unknown'}; current_chat_source=${currentChatSource || 'unknown'}; lore_candidates=${candidateCount}; active_lore=${activeLore.length}; max_chars=${settings.shadowRisuContextMaxChars}`
    );
    return compact(sections.filter(item => item !== null && item !== undefined).join('\n'), settings.shadowRisuContextMaxChars);
  };

  const buildShadowRisuContext = async (messages, recent, settings, snapshot = null, references = null) => {
    const refs = normalizeRisuReferences(
      references || settings?.activeStageOptions?.risuRefs,
      settings?.enableShadowRisuContext ? defaultRisuReferencesForStage('shadow_act') : { persona: false, characterDescription: false, characterLorebook: false, moduleLorebook: false }
    );
    const enabled = !!(refs.persona || refs.characterDescription || refs.characterLorebook || refs.moduleLorebook);
    const meta = { enabled, references: refs, available: false, character: false, persona: false, loreCandidates: 0, activeLore: 0, characterSource: 'missing', personaSource: 'missing', currentChatSource: 'missing' };
    if (!enabled) return { block: '', meta, snapshot };
    const source = snapshot || await loadRisuContextSnapshot(settings);
    const { characterInfo, character, chatInfo, persona, candidates } = source;
    const memory = formatRisuMemorySnapshot(chatInfo?.chat, Math.min(9000, settings.shadowRisuContextMaxChars || DEFAULT_SHADOW_RISU_CONTEXT_CHARS));
    const selectedCandidates = (candidates || []).filter(candidate => {
      if (candidate.sourceType === 'module') return refs.moduleLorebook;
      if (candidate.sourceType === 'character' || candidate.sourceType === 'chat') return refs.characterLorebook;
      return false;
    });
    const activeLore = activeRisuLorebooks(recent, selectedCandidates, settings);
    meta.available = !!(character || source.db || chatInfo?.chat || persona || selectedCandidates.length);
    meta.character = !!character;
    meta.persona = !!persona;
    meta.characterSource = characterInfo?.source || 'missing';
    meta.personaSource = persona?.__source || 'missing';
    meta.currentChatSource = chatInfo?.source || 'missing';
    meta.memoryChars = memory.length;
    meta.loreCandidates = selectedCandidates.length;
    meta.activeLore = activeLore.length;
    meta.loreSources = activeLore.reduce((acc, lore) => {
      acc[lore.sourceType || 'unknown'] = (acc[lore.sourceType || 'unknown'] || 0) + 1;
      return acc;
    }, {});
    meta.activeLoreItems = activeLore.slice(0, DEFAULT_SHADOW_ACTIVE_LORE_LIMIT).map(lore => ({
      label: lore.label,
      source: lore.source,
      sourceType: lore.sourceType,
      key: lore.key,
      position: lore.position || '',
      role: lore.role || 'system',
      depth: lore.depth || 0,
      priority: lore.priority,
      insertorder: lore.insertorder,
      chars: text(lore.content).length
    }));
    const block = meta.available ? formatShadowRisuContext({
      character,
      characterSource: characterInfo?.source,
      persona,
      currentChat: chatInfo?.chat,
      currentChatSource: chatInfo?.source,
      activeLore,
      candidateCount: selectedCandidates.length,
      settings,
      references: refs
    }) : '';
    return { block, meta, snapshot: source, activeLore, selectedCandidates, memory };
  };

  const isAuxiliaryType = (type) => {
    const raw = text(type || '').toLowerCase();
    if (!raw) return false;
    return /(embed|embedding|translate|translation|image|inlay|tts|summary|summarize|hypa|lore|memory|otherax|aux|checkinput|title|suggest|regex|module)/i.test(raw);
  };

  const shouldPassThrough = (messages, type, settings) => {
    if (settings.mode === 'off') return 'mode_off';
    if (!Array.isArray(messages)) return 'non_array_payload';
    if (!messages.length) return 'empty_messages';
    if (isAuxiliaryType(type)) return `auxiliary_type:${text(type)}`;
    const allText = compact(messages.map(m => contentToText(m?.content)).join('\n'), 6000);
    // LBDATA is structured lore text; only actual binary/visual payloads should disable the agent pipeline.
    if (/data:image\/|<svg|base64,/i.test(allText) && allText.length > 2500) return 'asset_heavy_payload';
    return '';
  };

  const responseBodyToText = async (response) => {
    if (!response) throw new Error('Empty fetch response');
    if (typeof response === 'string') return response;
    if (response.ok === false) {
      const errText = typeof response.text === 'function' ? await response.text().catch(() => '') : '';
      throw new Error(`HTTP ${response.status || ''}: ${compact(errText || response, 700)}`);
    }
    if (typeof response.text === 'function') return await response.text();
    if (response.body && typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let out = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        out += decoder.decode(value, { stream: true });
      }
      out += decoder.decode();
      return out;
    }
    if (typeof response.json === 'function') return JSON.stringify(await response.json());
    if (response && typeof response === 'object' && 'data' in response) return text(response.data);
    return text(response);
  };

  const responseToJsonOrText = async (response) => {
    if (!response) throw new Error('Empty fetch response');
    if (response && typeof response === 'object' && 'data' in response && !response.json && !response.text) return response.data;
    if (response.ok === false) {
      const errorBody = typeof response.text === 'function' ? await response.text().catch(() => '') : '';
      throw new Error(`HTTP ${response.status || ''}: ${compact(errorBody || response, 700)}`);
    }
    if (typeof response.json === 'function') {
      try { return await response.json(); } catch (_) {
        if (typeof response.text === 'function') {
          const raw = await response.text();
          return tryJsonParse(raw, null) || raw;
        }
        throw _;
      }
    }
    if (typeof response.text === 'function') {
      const raw = await response.text();
      return tryJsonParse(raw, null) || raw;
    }
    return response;
  };

  const providerContentSummary = (value) => {
    const body = contentToText(value);
    return { chars: body.length, preview: compact(body, 180) };
  };

  const summarizeProviderBody = (body) => {
    const obj = body && typeof body === 'object' ? body : {};
    const messageLike = Array.isArray(obj.messages)
      ? obj.messages.map(item => ({ role: item?.role || '', ...providerContentSummary(item?.content) }))
      : Array.isArray(obj.contents)
        ? obj.contents.map(item => ({ role: item?.role || '', ...providerContentSummary(item?.parts || item?.content || item) }))
        : [];
    const messageChars = messageLike.reduce((sum, item) => sum + (item.chars || 0), 0);
    const systemChars = providerContentSummary(obj.system || obj.systemInstruction || '').chars;
    const bodyKeys = Object.keys(obj).slice(0, 40);
    return {
      keys: bodyKeys,
      model: compact(obj.model || '', 160),
      stream: !!obj.stream,
      think: obj.think ?? obj.options?.think ?? null,
      temperature: obj.temperature ?? obj.generationConfig?.temperature ?? obj.options?.temperature ?? null,
      maxTokens: obj.max_tokens ?? obj.max_completion_tokens ?? obj.maxOutputTokens ?? obj.generationConfig?.maxOutputTokens ?? obj.options?.num_predict ?? null,
      messageCount: messageLike.length,
      messageChars,
      systemChars,
      messages: messageLike.slice(0, 8),
      bodyChars: (() => { try { return JSON.stringify(obj).length; } catch (_) { return 0; } })()
    };
  };

  const providerMeta = (meta = {}) => ({
    stage: compact(meta.stageName || meta.stage || '', 80),
    presetName: compact(meta.presetName || '', 120),
    provider: compact(meta.provider || '', 80),
    model: compact(meta.model || '', 180)
  });

  const rememberProviderRequest = (meta, url, body, headers = {}) => {
    Runtime.lastProviderRequest = {
      at: Date.now(),
      ...providerMeta(meta),
      url: compact(url, 700),
      headerKeys: Object.keys(headers || {}).filter(key => !/^authorization$/i.test(key)).slice(0, 40),
      body: summarizeProviderBody(body)
    };
    Runtime.lastProviderError = null;
  };

  const rememberProviderResponse = (meta, response, data) => {
    Runtime.lastProviderResponse = {
      at: Date.now(),
      ...providerMeta(meta),
      ok: response?.ok !== false,
      status: response?.status || null,
      dataPreview: compact(data, 1600)
    };
  };

  const rememberProviderError = (meta, error) => {
    Runtime.lastProviderError = {
      at: Date.now(),
      ...providerMeta(meta),
      message: compact(error?.message || error, 1600)
    };
  };

  const estimateTokensFromText = (value) => Math.max(1, Math.ceil(text(value || '').length / 3.4));
  const nextPowerOfTwo = (value) => {
    let n = 1024;
    const target = Math.max(1024, Number(value) || 1024);
    while (n < target && n < 65536) n *= 2;
    return n;
  };

  const stageOutputTokenBudget = (settings, stageName, systemPrompt, preset, options = {}) => {
    if (options.maxTokens) return options.maxTokens;
    const presetMax = clampInt(preset?.max_tokens, 64, 200000, DEFAULT_MAX_STAGE_TOKENS);
    const isAnalysis = /analysis phase|serial_gradation_agents_for_rp_analysis_v1/i.test(systemPrompt || '');
    const isPost = isPostStageId(stageName);
    const draftChars = clampInt(settings?.targetDraftMaxChars || DEFAULT_TARGET_DRAFT_MAX_CHARS, 500, 60000, DEFAULT_TARGET_DRAFT_MAX_CHARS);
    const wanted = isAnalysis ? 1200 : isPost ? 2200 : Math.ceil(draftChars / 2.2) + 1024;
    return Math.max(384, Math.min(presetMax, wanted, isAnalysis ? 1600 : 8192));
  };

  const contextSizeErrorInfo = (error) => {
    const msg = text(error?.message || error || '');
    if (!/(exceed_context_size|exceeds? the available context|n_ctx|context size)/i.test(msg)) return null;
    const promptTokens = Number(msg.match(/"n_prompt_tokens"\s*:\s*(\d+)/)?.[1] || msg.match(/request\s*\((\d+)\s*tokens\)/i)?.[1] || 0) || 0;
    const contextTokens = Number(msg.match(/"n_ctx"\s*:\s*(\d+)/)?.[1] || msg.match(/context size\s*\((\d+)\)/i)?.[1] || 0) || 0;
    return { message: compact(msg, 500), promptTokens, contextTokens };
  };

  const unsupportedThinkingErrorInfo = (error) => {
    const msg = text(error?.message || error || '');
    if (!/(does not support thinking|thinking.*not supported|unsupported.*thinking|think.*not supported)/i.test(msg)) return null;
    return { message: compact(msg, 500) };
  };

  const fitPromptsForContext = (systemPrompt, userPrompt, info = null) => {
    const promptTokens = info?.promptTokens || estimateTokensFromText(`${systemPrompt}\n${userPrompt}`);
    const contextTokens = info?.contextTokens || 4096;
    const safeTokens = Math.max(1500, Math.floor(contextTokens * 0.78));
    const ratio = Math.max(0.35, Math.min(0.88, safeTokens / Math.max(promptTokens, 1)));
    const systemMax = Math.max(900, Math.floor(text(systemPrompt).length * Math.min(1, ratio + 0.12)));
    const userMax = Math.max(1600, Math.floor(text(userPrompt).length * ratio));
    const fittedSystem = compactMiddle(systemPrompt, systemMax);
    const fittedUser = compactMiddle(userPrompt, userMax);
    return {
      systemPrompt: fittedSystem,
      userPrompt: fittedUser,
      changed: fittedSystem !== systemPrompt || fittedUser !== userPrompt,
      ratio,
      promptTokens,
      contextTokens
    };
  };

  const extractTextParts = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(extractTextParts).filter(Boolean).join('');
    if (Array.isArray(value.parts)) return value.parts.map(part => text(part?.text || '')).join('');
    if (Array.isArray(value.content)) return value.content.map(extractTextParts).filter(Boolean).join('');
    if (value.text) return text(value.text);
    if (value.output_text) return text(value.output_text);
    if (value.response) return text(value.response);
    return '';
  };

  const extractChatCompletionText = (data) => {
    if (!data || typeof data !== 'object') return '';
    const choice = data?.choices?.[0] || {};
    const message = choice.message || {};
    const delta = choice.delta || {};
    return text(
      extractTextParts(message.content)
      || extractTextParts(delta.content)
      || extractTextParts(choice.text)
      || extractTextParts(data.output_text)
      || (Array.isArray(data.output) ? data.output.map(item => extractTextParts(item?.content || item)).join('') : '')
      || extractTextParts(data.message?.content)
      || extractTextParts(data.content)
      || extractTextParts(data.response)
      || ''
    );
  };

  const extractThinkingText = (raw) => {
    const data = typeof raw === 'string' ? tryJsonParse(raw, null) : raw;
    if (!data || typeof data !== 'object') return '';
    const choice = data?.choices?.[0] || {};
    const message = choice.message || {};
    const delta = choice.delta || {};
    return text(
      extractTextParts(message.thinking)
      || extractTextParts(message.reasoning_content)
      || extractTextParts(message.reasoning)
      || extractTextParts(delta.thinking)
      || extractTextParts(delta.reasoning_content)
      || extractTextParts(data.message?.thinking)
      || extractTextParts(data.message?.reasoning_content)
      || extractTextParts(data.thinking)
      || extractTextParts(data.reasoning_content)
      || ''
    );
  };

  const thinkingOnlyReason = (raw) => {
    const thinking = extractThinkingText(raw);
    if (!thinking) return '';
    const data = typeof raw === 'string' ? tryJsonParse(raw, null) : raw;
    const done = text(data?.done_reason || data?.finish_reason || data?.choices?.[0]?.finish_reason || '').trim();
    return done ? `thinking_only:${done}` : 'thinking_only';
  };

  const parseSseChatText = (raw, provider = 'openai') => parseStreamText(raw, provider).content;

  const parseStreamText = (raw, provider = 'openai') => {
    const lines = String(raw || '').split(/\r?\n/);
    let out = '';
    let usage = null;
    let events = 0;
    const appendFromObject = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      events += 1;
      usage = obj.usage || obj.usageMetadata || obj.message_delta?.usage || usage;
      out += obj.choices?.[0]?.delta?.content || '';
      out += obj.choices?.[0]?.message?.content || '';
      out += obj.delta?.text || '';
      if (typeof obj.delta === 'string' && /output_text|content_part/i.test(String(obj.type || ''))) out += obj.delta;
      out += obj.output_text || '';
      out += obj.response?.output_text || '';
      out += obj.message?.content || '';
      out += typeof obj.response === 'string' ? obj.response : '';
      out += obj.text || '';
      const candidateParts = obj.candidates?.[0]?.content?.parts || obj.candidates?.[0]?.content?.Parts || [];
      if (Array.isArray(candidateParts)) out += candidateParts.map(part => text(part?.text || '')).join('');
      if (Array.isArray(obj.content)) out += obj.content.map(block => text(block?.text || '')).join('');
    };
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const m = trimmed.match(/^data:\s*(.*)$/i);
      const body = (m ? m[1] : trimmed).trim();
      if (!body || body === '[DONE]') continue;
      const obj = tryJsonParse(body, null);
      if (obj) appendFromObject(obj);
    }
    return { content: out.trim(), usage, streamMeta: { provider, events } };
  };

  const normalizeExtraHeaders = (preset) => {
    const parsed = tryJsonParse(preset.extra_headers_json, {});
    const out = {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [key, value] of Object.entries(parsed)) {
        const k = String(key || '').trim();
        if (k) out[k] = String(value ?? '');
      }
    }
    return out;
  };

  const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
  const deepMergeJson = (base, override) => {
    if (!isPlainObject(base) || !isPlainObject(override)) return override;
    const out = { ...base };
    for (const [key, value] of Object.entries(override)) {
      out[key] = isPlainObject(value) && isPlainObject(out[key]) ? deepMergeJson(out[key], value) : value;
    }
    return out;
  };
  const applyPresetExtraBody = (body, preset) => {
    const raw = text(preset?.extra_body_json || '').trim();
    if (!raw) return body;
    const parsed = tryJsonParse(raw, null);
    if (!isPlainObject(parsed)) throw new Error('추가 Body JSON은 JSON 객체여야 합니다.');
    return deepMergeJson(body, parsed);
  };

  const hasReasoningStyle = (preset) => preset.reasoning_effort && preset.reasoning_effort !== 'none';

  const shouldUseMaxCompletionTokens = (preset, family = effectiveReasoningFamilyForPreset(preset)) => {
    const p = canonicalProvider(preset.provider);
    if (['heroku-us','heroku-eu','xiaomi-mimo','xiaomi-mimo-token-plan-cn','xiaomi-mimo-token-plan-sgp','xiaomi-mimo-token-plan-ams'].includes(p)) return true;
    if (p !== 'openai' && p !== 'vertex-openai' && p !== 'copilot') return family === 'gpt';
    const model = String(preset.model || '').toLowerCase();
    return family === 'gpt' || hasReasoningStyle(preset) || /^(o\d|gpt-5|gpt-4\.1|gpt-4o-mini-search|gpt-4o-search)/i.test(model);
  };

  const buildOpenAICompatPayload = (preset, systemPrompt, userPrompt, options = {}) => {
    const provider = canonicalProvider(preset.provider || 'custom');
    const family = effectiveReasoningFamilyForPreset(preset);
    const budget = resolveProviderOutputBudget(preset, options, family);
    const body = {
      model: preset.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: options.temp ?? preset.temp,
      stream: !!preset.stream
    };
    if (shouldUseMaxCompletionTokens(preset, family)) body.max_completion_tokens = budget.providerMaxTokens;
    else body.max_tokens = budget.providerMaxTokens;

    if (family === 'openrouter' && budget.transformActive) {
      if (!budget.reasoningAllowed) body.reasoning = { enabled: false };
      else if (preset.reasoning_effort && preset.reasoning_effort !== 'none') body.reasoning = { enabled: true, effort: preset.reasoning_effort };
      else if (budget.reasoningBudgetTokens > 0) body.reasoning = { enabled: true, max_tokens: budget.reasoningBudgetTokens };
      else body.reasoning = { enabled: true };
    } else if (family === 'gpt' && budget.reasoningAllowed && preset.reasoning_effort && preset.reasoning_effort !== 'none') {
      body.reasoning_effort = preset.reasoning_effort;
      delete body.temperature;
    } else if (family === 'deepseek') {
      delete body.temperature;
    } else if ((family === 'kimi' || family === 'glm') && budget.transformActive) {
      body.thinking = { type: budget.reasoningAllowed ? getConfiguredThinkingType(preset) : 'disabled' };
    }

    const serviceTierAllowed = provider !== 'custom' || preset.custom_service_tier_passthrough;
    if (serviceTierAllowed && preset.service_tier && preset.service_tier !== 'off') body.service_tier = preset.service_tier;
    if (body.stream && ['openai', 'openrouter'].includes(provider)) body.stream_options = { include_usage: true };
    return applyPresetExtraBody(body, preset);
  };


  const CopilotToken = { cache: new Map() };
  const getCopilotBearerToken = async (rawKey) => {
    const key = stripBearerPrefix(rawKey);
    if (!key) throw new Error('Copilot token missing');
    const cached = CopilotToken.cache.get(key);
    if (cached?.token && Date.now() < cached.expiry) return cached.token;
    if (/^(eyJ|ghu_|gho_|ghp_|github_pat_|oauth_)/i.test(key)) {
      try {
        const response = await RisuCompat.nativeFetch('https://api.github.com/copilot_internal/v2/token', {
          method: 'GET',
          headers: {
            Authorization: `token ${key}`,
            Accept: 'application/json',
            'Editor-Version': 'vscode/1.85.0',
            'Editor-Plugin-Version': 'copilot-chat/0.22.0'
          }
        }, 30000);
        const data = await responseToJsonOrText(response);
        const token = text(data?.token || data?.access_token || '').trim();
        if (token) {
          const expiry = Number(data?.expires_at || data?.expiry || 0) * 1000 || Date.now() + 25 * 60 * 1000;
          CopilotToken.cache.set(key, { token, expiry });
          return token;
        }
      } catch (error) {
        warn('copilot_token_exchange_failed', error);
      }
    }
    return key;
  };

  const applyOpenAIProviderHeaders = (headers, provider) => {
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] ||= 'https://risuai.xyz';
      headers['X-Title'] ||= 'Serial Gradation Agents for RP';
    } else if (provider === 'featherless') {
      headers['HTTP-Referer'] ||= 'https://risuai.xyz';
      headers['X-Title'] ||= 'Serial Gradation Agents for RP';
    } else if (provider === 'z-ai' || provider === 'z-ai-coding') {
      headers['Accept-Language'] ||= 'en-US,en';
    } else if (provider === 'copilot') {
      headers['Editor-Version'] ||= 'vscode/1.85.0';
      headers['Editor-version'] ||= 'vscode/1.85.0';
      headers['Editor-Plugin-Version'] ||= 'copilot-chat/0.22.0';
      headers['Editor-plugin-version'] ||= 'copilot-chat/0.22.0';
      headers['Copilot-Integration-Id'] ||= 'vscode-chat';
      headers['User-Agent'] ||= 'GitHubCopilotChat/0.22.0';
      headers['X-Github-Api-Version'] ||= '2025-10-01';
      headers['X-Initiator'] ||= 'user';
    }
    return headers;
  };

  const callOpenAIResponses = async (preset, systemPrompt, userPrompt, options = {}) => {
    const provider = canonicalProvider(preset.provider || 'custom');
    const direct = directProviderDefinition(provider);
    if (direct && !direct.responsesPath) throw new Error(`${direct.label}는 Responses 형식을 지원하지 않습니다. Chat Completions를 선택하세요.`);
    if (!providerSupportsResponses(provider)) throw new Error(`${providerDisplayLabel(provider)}는 Responses 형식을 지원하지 않습니다.`);
    const base = validateDirectProviderUrl(provider, resolveProviderBaseUrl(provider, preset.url, 'llm'));
    const url = direct ? resolveDirectProviderEndpoint(provider, base, 'responses') : joinProviderEndpoint(base, '/v1/responses');
    const headers = applyOpenAIProviderHeaders({ 'Content-Type': 'application/json', ...normalizeExtraHeaders(preset) }, provider);
    if (preset.key) headers.Authorization = `Bearer ${stripBearerPrefix(preset.key)}`;
    const family = effectiveReasoningFamilyForPreset(preset);
    const budget = resolveProviderOutputBudget(preset, options, family);
    let body = {
      model: preset.model,
      input: [{ role: 'user', content: [{ type: 'input_text', text: String(userPrompt || '') }] }],
      max_output_tokens: budget.providerMaxTokens,
      stream: !!preset.stream
    };
    if (String(systemPrompt || '').trim()) body.instructions = String(systemPrompt);
    if (family === 'openrouter' && budget.transformActive) {
      if (!budget.reasoningAllowed) body.reasoning = { enabled: false };
      else if (preset.reasoning_effort && preset.reasoning_effort !== 'none') body.reasoning = { effort: preset.reasoning_effort };
      else if (budget.reasoningBudgetTokens > 0) body.reasoning = { max_tokens: budget.reasoningBudgetTokens };
      else body.reasoning = { enabled: true };
    } else if (family === 'gpt' && budget.reasoningAllowed && preset.reasoning_effort && preset.reasoning_effort !== 'none') {
      body.reasoning = { effort: preset.reasoning_effort };
    }
    body = applyPresetExtraBody(body, preset);
    const traceMeta = { ...(options.traceMeta || {}), provider: `${provider}:responses`, model: preset.model };
    rememberProviderRequest(traceMeta, url, body, headers);
    const response = await RisuCompat.nativeFetch(url, { method: 'POST', headers, body: JSON.stringify(body) }, preset.timeout_ms);
    if (preset.stream) {
      const raw = await responseBodyToText(response);
      const streamed = parseStreamText(raw, `${provider}:responses`);
      rememberProviderResponse(traceMeta, response, raw);
      return { content: streamed.content, raw, usage: streamed.usage, model: preset.model, streamMeta: streamed.streamMeta, streamed: true };
    }
    const data = await responseToJsonOrText(response);
    rememberProviderResponse(traceMeta, response, data);
    return { content: text(extractChatCompletionText(data)), raw: data, usage: data?.usage || null, model: data?.model || preset.model };
  };

  const callOpenAICompat = async (preset, systemPrompt, userPrompt, options = {}) => {
    const provider = canonicalProvider(preset.provider || 'custom');
    if (normalizeLLMRequestFormat(preset.request_format) === 'responses') return await callOpenAIResponses({ ...preset, provider }, systemPrompt, userPrompt, options);
    const url = normalizeOpenAICompatUrl(preset.url, provider);
    const headers = applyOpenAIProviderHeaders({ 'Content-Type': 'application/json', ...normalizeExtraHeaders(preset) }, provider);
    let authToken = preset.key;
    if (provider === 'copilot') authToken = await getCopilotBearerToken(preset.key);
    if (authToken) headers.Authorization = `Bearer ${stripBearerPrefix(authToken)}`;
    const body = buildOpenAICompatPayload({ ...preset, provider }, systemPrompt, userPrompt, options);
    const traceMeta = { ...(options.traceMeta || {}), provider, model: preset.model };
    rememberProviderRequest(traceMeta, url, body, headers);
    const response = await RisuCompat.nativeFetch(url, { method: 'POST', headers, body: JSON.stringify(body) }, preset.timeout_ms);
    if (preset.stream) {
      const raw = await responseBodyToText(response);
      const streamed = parseStreamText(raw, provider);
      rememberProviderResponse(traceMeta, response, raw);
      return { content: streamed.content, raw, usage: streamed.usage, model: preset.model, streamMeta: streamed.streamMeta, streamed: true };
    }
    const data = await responseToJsonOrText(response);
    rememberProviderResponse(traceMeta, response, data);
    const streamed = typeof data === 'string' ? parseStreamText(data, provider) : null;
    const content = streamed?.content || extractChatCompletionText(data);
    return { content: text(content), raw: data, usage: data?.usage || null, model: data?.model || preset.model };
  };

  const callAnthropic = async (preset, systemPrompt, userPrompt, options = {}) => {
    let url = String(preset.url || defaultUrlForProvider('claude') || '').trim().replace(/\/+$/, '');
    if (!/\/v1\/messages$/i.test(url)) url = `${url}/v1/messages`.replace(/\/v1\/v1\/messages$/i, '/v1/messages');
    const headers = { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', ...normalizeExtraHeaders(preset) };
    if (preset.key) headers['x-api-key'] = preset.key;
    const family = effectiveReasoningFamilyForPreset(preset);
    const budget = resolveProviderOutputBudget(preset, options, family);
    let body = {
      model: preset.model,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: options.temp ?? preset.temp,
      max_tokens: budget.providerMaxTokens,
      stream: !!preset.stream
    };
    if (family === 'claude' && budget.transformActive) {
      body.thinking = { type: budget.reasoningAllowed ? 'adaptive' : 'disabled' };
      if (budget.reasoningAllowed) {
        if (preset.reasoning_effort && preset.reasoning_effort !== 'none') body.output_config = { effort: preset.reasoning_effort };
        delete body.temperature;
      }
    } else if (family === 'claude_budget' && budget.transformActive && budget.reasoningAllowed && budget.reasoningBudgetTokens >= 1024 && budget.providerMaxTokens > budget.reasoningBudgetTokens) {
      body.thinking = { type: 'enabled', budget_tokens: budget.reasoningBudgetTokens };
      delete body.temperature;
    } else if (family === 'claude_budget' && budget.transformActive) body.thinking = { type: 'disabled' };
    body = applyPresetExtraBody(body, preset);
    const traceMeta = { ...(options.traceMeta || {}), provider: 'anthropic', model: preset.model };
    rememberProviderRequest(traceMeta, url, body, headers);
    const response = await RisuCompat.nativeFetch(url, { method: 'POST', headers, body: JSON.stringify(body) }, preset.timeout_ms);
    if (preset.stream) {
      const raw = await responseBodyToText(response);
      const streamed = parseStreamText(raw, 'anthropic');
      rememberProviderResponse(traceMeta, response, raw);
      return { content: streamed.content, raw, usage: streamed.usage, model: preset.model, streamMeta: streamed.streamMeta, streamed: true };
    }
    const data = await responseToJsonOrText(response);
    rememberProviderResponse(traceMeta, response, data);
    const content = Array.isArray(data?.content) ? data.content.map(p => p?.text || '').join('') : data?.completion || data?.content || '';
    return { content: text(content), raw: data, usage: data?.usage || null, model: data?.model || preset.model };
  };

  const GeminiTokenCache = { cache: new Map() };

  const pemToArrayBuffer = (pem) => {
    const b64 = String(pem || '').replace(/\\n/g, '\n').replace(/-----BEGIN PRIVATE KEY-----/g, '').replace(/-----END PRIVATE KEY-----/g, '').replace(/\s+/g, '');
    if (typeof atob === 'function') {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    }
    if (typeof Buffer !== 'undefined') return Uint8Array.from(Buffer.from(b64, 'base64')).buffer;
    throw new Error('No base64 decoder available for Vertex service account key.');
  };

  const base64url = (bytes) => {
    let binary = '';
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    for (let i = 0; i < arr.length; i += 1) binary += String.fromCharCode(arr[i]);
    let encoded = '';
    if (typeof btoa === 'function') encoded = btoa(binary);
    else if (typeof Buffer !== 'undefined') encoded = Buffer.from(arr).toString('base64');
    else throw new Error('No base64 encoder available.');
    return encoded.replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  const generateVertexAccessToken = async (clientEmail, privateKey) => {
    if (!globalThis.crypto?.subtle) throw new Error('crypto.subtle is unavailable; use a direct Vertex Bearer token or access_token JSON.');
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claimSet = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };
    const encodedHeader = base64url(new TextEncoder().encode(JSON.stringify(header)));
    const encodedClaimSet = base64url(new TextEncoder().encode(JSON.stringify(claimSet)));
    const key = await globalThis.crypto.subtle.importKey('pkcs8', pemToArrayBuffer(privateKey), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
    const signature = await globalThis.crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${encodedHeader}.${encodedClaimSet}`));
    const jwt = `${encodedHeader}.${encodedClaimSet}.${base64url(new Uint8Array(signature))}`;
    const response = await RisuCompat.nativeFetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${encodeURIComponent(jwt)}`
    }, 45000);
    const data = await responseToJsonOrText(response);
    const token = text(data?.access_token || '').trim();
    if (!token) throw new Error(`No access_token in Vertex token response: ${compact(data, 500)}`);
    return token;
  };

  const getVertexAccessToken = async (rawKey) => {
    const cacheKey = text(rawKey || '').trim();
    const cached = GeminiTokenCache.cache.get(cacheKey);
    if (cached?.token && Date.now() < cached.expiry) return cached.token;
    const credentials = tryJsonParse(cacheKey, null);
    if (credentials && typeof credentials === 'object') {
      if (credentials.access_token || credentials.token) {
        const token = text(credentials.access_token || credentials.token).trim();
        if (!token) throw new Error('Vertex access_token is empty.');
        const expiresAtRaw = Number(credentials.expires_at || credentials.expiry || credentials.expiration_time || 0) || 0;
        const expiresAtMs = expiresAtRaw > 100000000000 ? expiresAtRaw : expiresAtRaw > 1000000000 ? expiresAtRaw * 1000 : 0;
        const expiresIn = Number(credentials.expires_in || 0) || 0;
        const expiry = expiresAtMs || (expiresIn ? Date.now() + Math.max(30, expiresIn - 60) * 1000 : Date.now() + 50 * 60 * 1000);
        GeminiTokenCache.cache.set(cacheKey, { token, expiry });
        return token;
      }
      const clientEmail = text(credentials.client_email || '').trim();
      const privateKey = text(credentials.private_key || '').trim();
      if (!clientEmail || !privateKey) throw new Error('Vertex credentials missing client_email/private_key or access_token.');
      const token = await generateVertexAccessToken(clientEmail, privateKey);
      GeminiTokenCache.cache.set(cacheKey, { token, expiry: Date.now() + 3500 * 1000 });
      return token;
    }
    const directToken = stripBearerPrefix(cacheKey);
    if (!directToken) throw new Error('Vertex token missing.');
    return directToken;
  };

  const callGeminiLike = async (preset, systemPrompt, userPrompt, mode, options = {}) => {
    const isVertex = mode === 'vertex_gemini';
    const key = preset.key;
    const endpoint = isVertex
      ? normalizeVertexGeminiEndpoint(preset.url, key, preset.model, preset.stream ? 'streamGenerateContent' : 'generateContent')
      : normalizeGeminiApiEndpoint(preset.url, preset.model, preset.stream ? 'streamGenerateContent' : 'generateContent');
    const url = preset.stream ? appendQueryParam(endpoint, 'alt=sse') : endpoint;
    const headers = { 'Content-Type': 'application/json', ...normalizeExtraHeaders(preset) };
    if (isVertex) headers.Authorization = `Bearer ${await getVertexAccessToken(key)}`;
    else if (key) headers['x-goog-api-key'] = key;
    const family = effectiveReasoningFamilyForPreset(preset);
    const budget = resolveProviderOutputBudget(preset, options, family);
    const generationConfig = {
      temperature: options.temp ?? preset.temp,
      maxOutputTokens: budget.providerMaxTokens
    };
    if (family === 'gemini' && budget.transformActive && budget.reasoningAllowed) {
      const level = preset.reasoning_effort === 'high' ? 'HIGH' : preset.reasoning_effort === 'low' ? 'LOW' : 'MEDIUM';
      generationConfig.thinkingConfig = { thinkingLevel: level, includeThoughts: false };
    } else if (family === 'gemini_budget' && budget.transformActive && budget.reasoningAllowed) {
      generationConfig.thinkingConfig = { thinkingBudget: budget.reasoningBudgetTokens, includeThoughts: false };
    } else if (['gemini','gemini_budget'].includes(family) && budget.transformActive && !budget.reasoningAllowed) {
      generationConfig.thinkingConfig = { thinkingBudget: 0, includeThoughts: false };
    }
    let body = {
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig
    };
    body = applyPresetExtraBody(body, preset);
    const traceMeta = { ...(options.traceMeta || {}), provider: mode, model: preset.model };
    rememberProviderRequest(traceMeta, url, body, headers);
    const response = await RisuCompat.nativeFetch(url, { method: 'POST', headers, body: JSON.stringify(body) }, preset.timeout_ms);
    if (preset.stream) {
      const raw = await responseBodyToText(response);
      const streamed = parseStreamText(raw, isVertex ? 'vertex' : 'gemini');
      rememberProviderResponse(traceMeta, response, raw);
      return { content: streamed.content, raw, usage: streamed.usage, model: preset.model, streamMeta: streamed.streamMeta, streamed: true };
    }
    const data = await responseToJsonOrText(response);
    rememberProviderResponse(traceMeta, response, data);
    const parts = data?.candidates?.[0]?.content?.parts || data?.candidates?.[0]?.content?.Parts || [];
    const content = Array.isArray(parts) ? parts.map(p => p?.text || '').join('') : data?.text || data?.response || '';
    return { content: text(content), raw: data, usage: data?.usageMetadata || data?.usage || null, model: preset.model };
  };

  const callVertexOpenAI = async (preset, systemPrompt, userPrompt, options = {}) => {
    const url = vertexOpenAIUrl(preset.url, preset.key);
    const token = await getVertexAccessToken(preset.key);
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...normalizeExtraHeaders(preset) };
    const body = buildOpenAICompatPayload({ ...preset, provider: 'vertex-openai' }, systemPrompt, userPrompt, options);
    const traceMeta = { ...(options.traceMeta || {}), provider: 'vertex-openai', model: preset.model };
    rememberProviderRequest(traceMeta, url, body, headers);
    const response = await RisuCompat.nativeFetch(url, { method: 'POST', headers, body: JSON.stringify(body) }, preset.timeout_ms);
    if (preset.stream) {
      const raw = await responseBodyToText(response);
      const streamed = parseStreamText(raw, 'vertex-openai');
      rememberProviderResponse(traceMeta, response, raw);
      return { content: streamed.content, raw, usage: streamed.usage, model: preset.model, streamMeta: streamed.streamMeta, streamed: true };
    }
    const data = await responseToJsonOrText(response);
    rememberProviderResponse(traceMeta, response, data);
    const content = extractChatCompletionText(data);
    return { content: text(content), raw: data, usage: data?.usage || null, model: data?.model || preset.model };
  };

  const callOllamaNative = async (preset, systemPrompt, userPrompt, options = {}) => {
    const url = ollamaApiUrl(preset.url, '/api/chat');
    const headers = { 'Content-Type': 'application/json', ...normalizeExtraHeaders(preset) };
    if (preset.key) headers.Authorization = `Bearer ${stripBearerPrefix(preset.key)}`;
    let body = {
      model: preset.model,
      messages: [
        systemPrompt ? { role: 'system', content: systemPrompt } : null,
        { role: 'user', content: userPrompt }
      ].filter(Boolean),
      stream: !!preset.stream,
      options: {
        temperature: options.temp ?? preset.temp,
        num_predict: resolveProviderOutputBudget(preset, options, effectiveReasoningFamilyForPreset(preset)).providerMaxTokens
      }
    };
    const promptTokens = estimateTokensFromText(`${systemPrompt || ''}\n${userPrompt || ''}`);
    const predictTokens = clampInt(body.options.num_predict, 64, 200000, DEFAULT_MAX_STAGE_TOKENS);
    const autoCtx = nextPowerOfTwo(promptTokens + Math.min(predictTokens, 4096) + 512);
    body.options.num_ctx = Math.max(body.options.num_ctx || 0, Math.min(autoCtx, 32768));
    if (preset.reasoning_budget_tokens > 0) body.options.num_ctx = Math.max(body.options.num_ctx || 0, preset.reasoning_budget_tokens);
    const ollamaFamily = effectiveReasoningFamilyForPreset(preset);
    const ollamaBudget = resolveProviderOutputBudget(preset, options, ollamaFamily);
    if (ollamaFamily === 'ollama' && ollamaBudget.transformActive) {
      if (!ollamaBudget.reasoningAllowed) body.think = false;
      else if (preset.reasoning_effort && preset.reasoning_effort !== 'none') body.think = preset.reasoning_effort;
      else body.think = true;
    }
    body = applyPresetExtraBody(body, preset);
    if (options.suppressThink || options.forceNoThinking) {
      delete body.think;
      if (body.options && typeof body.options === 'object') {
        delete body.options.think;
        delete body.options.thinking;
      }
    }
    const traceMeta = { ...(options.traceMeta || {}), provider: 'ollama', model: preset.model };
    rememberProviderRequest(traceMeta, url, body, headers);
    const response = await RisuCompat.nativeFetch(url, { method: 'POST', headers, body: JSON.stringify(body) }, preset.timeout_ms);
    if (preset.stream) {
      const raw = await responseBodyToText(response);
      const streamed = parseStreamText(raw, 'ollama');
      rememberProviderResponse(traceMeta, response, raw);
      return { content: streamed.content, raw, usage: streamed.usage, model: preset.model, streamMeta: streamed.streamMeta, streamed: true };
    }
    const data = await responseToJsonOrText(response);
    rememberProviderResponse(traceMeta, response, data);
    const content = extractChatCompletionText(data);
    return { content: text(content), raw: data, usage: data?.usage || null, model: data?.model || preset.model };
  };

  const callLLMWithPreset = async (settings, stageName, systemPrompt, userPrompt, options = {}) => {
    const resolved = resolvePreset(settings, stageName);
    const timeoutOverride = settings?.stageOptions?.[stageName]
      ? stageExecutionOptions(settings, stageName).timeoutMs
      : 0;
    const name = resolved.name;
    const preset = timeoutOverride ? sanitizePreset({ ...resolved.preset, timeout_ms: timeoutOverride }) : resolved.preset;
    if (!providerConfigured(preset)) return { ok: false, skipped: true, reason: `preset_unconfigured:${name}`, presetName: name };
    const startedAt = Date.now();
    const provider = canonicalProvider(preset.provider || 'custom');
    const mode = modeForProvider(provider);
    const effectiveOptions = {
      ...options,
      maxTokens: options.maxTokens || stageOutputTokenBudget(settings, stageName, systemPrompt, preset, options)
    };
    const tracedOptions = { ...effectiveOptions, traceMeta: { stageName, presetName: name, provider, model: preset.model } };
    let result;
    try {
      if (mode === 'anthropic') result = await callAnthropic({ ...preset, provider }, systemPrompt, userPrompt, tracedOptions);
      else if (mode === 'gemini' || mode === 'vertex_gemini') result = await callGeminiLike({ ...preset, provider }, systemPrompt, userPrompt, mode, tracedOptions);
      else if (mode === 'vertex_openai') result = await callVertexOpenAI({ ...preset, provider }, systemPrompt, userPrompt, tracedOptions);
      else if (mode === 'ollama_native') result = await callOllamaNative({ ...preset, provider }, systemPrompt, userPrompt, tracedOptions);
      else result = await callOpenAICompat({ ...preset, provider }, systemPrompt, userPrompt, tracedOptions);
    } catch (error) {
      rememberProviderError({ stageName, presetName: name, provider, model: preset.model }, error);
      const thinkingUnsupported = unsupportedThinkingErrorInfo(error);
      if (thinkingUnsupported && !options.thinkingUnsupportedRetry) {
        warn('thinking_unsupported_retry', `${stageName}: ${thinkingUnsupported.message}; retrying without think parameter`);
        return await callLLMWithPreset(settings, stageName, systemPrompt, userPrompt, {
          ...options,
          maxTokens: effectiveOptions.maxTokens,
          suppressThink: true,
          forceNoThinking: true,
          thinkingUnsupportedRetry: true
        });
      }
      const contextInfo = contextSizeErrorInfo(error);
      if (contextInfo && !options.contextRetry) {
        const fitted = fitPromptsForContext(systemPrompt, userPrompt, contextInfo);
        if (fitted.changed) {
          warn('context_fit_retry', `${stageName}: prompt ${contextInfo.promptTokens || '?'} > ctx ${contextInfo.contextTokens || '?'}, retrying with ${(fitted.ratio * 100).toFixed(0)}% prompt budget`);
          return await callLLMWithPreset(settings, stageName, fitted.systemPrompt, fitted.userPrompt, {
            ...options,
            maxTokens: effectiveOptions.maxTokens,
            contextRetry: true
          });
        }
      }
      throw error;
    }
    if (!result.content) {
      const thinkingReason = thinkingOnlyReason(result.raw);
      if (thinkingReason && !options.noThinkingRetry) {
        warn('thinking_only_retry', `${stageName}: provider returned ${thinkingReason}; retrying with thinking disabled`);
        return await callLLMWithPreset(
          settings,
          stageName,
          `${systemPrompt}\n\nCRITICAL RETRY: Do not write hidden reasoning, analysis notes, planning notes, or scratchpad. Return only the final compact JSON object or the complete RP response draft as plain text.`,
          `${userPrompt}\n\nReturn the final response draft now. Do not include planning, checklist, self-correction, or analysis.`,
          {
            ...options,
            maxTokens: effectiveOptions.maxTokens,
            temp: Math.min(Number(options.temp ?? preset.temp ?? 0.35) || 0.35, 0.45),
            forceNoThinking: true,
            noThinkingRetry: true
          }
        );
      }
      rememberProviderError(
        { stageName, presetName: name, provider, model: preset.model },
        `${thinkingReason || 'empty_completion'}: ${compact(result.raw || '', 800)}`
      );
      return { ok: false, reason: thinkingReason || 'empty_completion', raw: result.raw, presetName: name, provider };
    }
    return {
      ok: true,
      content: text(result.content),
      model: result.model || preset.model,
      provider,
      presetName: name,
      usage: result.usage || null,
      streamMeta: result.streamMeta || null,
      streamed: !!result.streamed,
      elapsedMs: Date.now() - startedAt
    };
  };

  const testProviderPreset = async (preset) => {
    const clean = sanitizePreset(preset || {});
    const settings = {
      presets: { __connection_test__: clean, default: clean },
      defaultPresetName: '__connection_test__',
      stagePresetNames: { shadow_act: '__connection_test__' }
    };
    return await callLLMWithPreset(
      settings,
      'shadow_act',
      'This is a provider connection test. Reply with a brief confirmation only.',
      'Reply with OK.',
      { maxTokens: Math.min(64, clean.max_tokens || 64), temp: 0 }
    );
  };

  const stripCodeFence = (raw) => {
    const body = text(raw).trim();
    const fence = body.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return fence ? fence[1].trim() : body;
  };

  const extractJsonObjectString = (raw) => {
    const source = stripCodeFence(raw);
    if (!source) return '';
    if (source.startsWith('{') && source.endsWith('}')) return source;
    const first = source.indexOf('{');
    if (first < 0) return '';
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = first; i < source.length; i += 1) {
      const ch = source[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth += 1;
      if (ch === '}') {
        depth -= 1;
        if (depth === 0) return source.slice(first, i + 1);
      }
    }
    return '';
  };

  const extractLooseJsonObjectString = (raw) => {
    const strict = extractJsonObjectString(raw);
    if (strict) return strict;
    const source = stripCodeFence(raw);
    const first = source.indexOf('{');
    const last = source.lastIndexOf('}');
    if (first >= 0 && last > first) return source.slice(first, last + 1);
    return source.trim();
  };

  const escapeJsonStringControlChars = (value) => {
    let out = '';
    let inString = false;
    let escape = false;
    for (const ch of String(value || '')) {
      if (escape) {
        out += ch;
        escape = false;
        continue;
      }
      if (ch === '\\') {
        out += ch;
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        out += ch;
        continue;
      }
      if (inString && ch === '\n') out += '\\n';
      else if (inString && ch === '\r') out += '\\r';
      else if (inString && ch === '\t') out += '\\t';
      else out += ch;
    }
    return out;
  };

  const quoteBareJsonKeys = (value) => String(value || '').replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_-]*)(\s*:)/g, '$1"$2"$3');

  const singleQuotedJsonStrings = (value) => String(value || '').replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, inner) => JSON.stringify(inner.replace(/\\'/g, "'")));

  const jsonRepairCandidates = (json) => {
    const normalized = String(json || '')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/,\s*([}\]])/g, '$1');
    const variants = [
      json,
      normalized,
      escapeJsonStringControlChars(normalized),
      quoteBareJsonKeys(normalized),
      escapeJsonStringControlChars(quoteBareJsonKeys(normalized)),
      singleQuotedJsonStrings(quoteBareJsonKeys(normalized)),
      escapeJsonStringControlChars(singleQuotedJsonStrings(quoteBareJsonKeys(normalized)))
    ];
    return [...new Set(variants.filter(Boolean))];
  };

  const relaxedJsonParse = (raw) => {
    const json = extractLooseJsonObjectString(raw);
    if (!json) return null;
    for (const attempt of jsonRepairCandidates(json)) {
      try { return JSON.parse(attempt); } catch (_) {}
    }
    return null;
  };

  const normalizeStringArray = (value, maxItems = 12, maxChars = 240) => {
    const arr = Array.isArray(value) ? value : (value ? [value] : []);
    return arr.map(item => compact(item, maxChars)).filter(Boolean).slice(0, maxItems);
  };

  const responseDraftObjectToText = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value !== 'object') return text(value);
    const blocks = [
      value.thoughts_block,
      value.title_block,
      value.header,
      value.body,
      value.response_body,
      value.status_line
    ].map(part => text(part || '').trim()).filter(Boolean);
    return blocks.join('\n\n');
  };

  const draftBodyText = (value) => {
    const raw = text(value || '').replace(/\\n/g, '\n').replace(/\\r/g, '\r').trim();
    return raw.split(/\n+/)
      .map(line => line.trim())
      .filter(line => line
        && !/^#{1,6}\s+/.test(line)
        && !/^Chatindex\s*:/i.test(line)
        && !/^####?\s*Chatindex\s*:/i.test(line)
        && !/^⏱️?\s*\[?\d{4}-\d{2}-\d{2}/.test(line))
      .join('\n')
      .trim();
  };

  const isUsableDraftText = (value) => {
    const raw = compact(value || '', 80000);
    if (!raw) return false;
    const body = draftBodyText(raw);
    if (raw.length >= DEFAULT_TARGET_DRAFT_MIN_CHARS && body.length >= 80) return true;
    return raw.length >= 160 && body.length >= 100;
  };

  const hasCompleteDraftEnding = (value) => {
    const body = draftBodyText(value).trim();
    return /[.!?…。！？"”'’)\]>]$/.test(body);
  };

  const hiddenReasoningStartRe = /^\s*(?:<\s*(?:thoughts?|thinking|reasoning|analysis)\s*>|(?:thoughts?|thinking|reasoning|analysis|key beats|structure|constraints check)\s*:)/i;
  const responseStartRe = /(?:^|\n)\s*(?:#\s*(?:응답|response)(?:\s|$)|#{2,6}\s+|####?\s*Chatindex\s*:|⏱️?\s*\[?\d{4}-\d{2}-\d{2}|<img\s+cmd=)/i;

  const stripHiddenReasoningBlocks = (value) => {
    let body = text(value || '').trim();
    if (!body) return '';
    body = body.replace(/<\s*(?:thoughts?|thinking|reasoning|analysis)\s*>[\s\S]*?<\s*\/\s*(?:thoughts?|thinking|reasoning|analysis)\s*>\s*/gi, '').trim();
    if (hiddenReasoningStartRe.test(body)) {
      const marker = body.search(responseStartRe);
      if (marker >= 0) body = body.slice(marker).trim();
      else return '';
    }
    body = body.replace(/^\s*(?:key beats|structure|constraints check)\s*:\s*[\s\S]*?(?=\n\s*(?:#\s*(?:응답|response)(?:\s|$)|#{2,6}\s+|####?\s*Chatindex\s*:|⏱️|<img\s+cmd=))/i, '').trim();
    return body;
  };

  const sanitizeMessageContentForHistory = (role, value) => {
    const raw = text(value || '');
    if (role !== 'assistant') return raw;
    const hadHiddenBlock = /<\s*(?:thoughts?|thinking|reasoning|analysis)\s*>/i.test(raw) || hiddenReasoningStartRe.test(raw);
    if (!hadHiddenBlock) return raw;
    let body = stripHiddenReasoningBlocks(raw);
    if (responseStartRe.test(body)) {
      body = body.replace(/^\s*(?:Of course!?|Sure[.!]?|Certainly[.!]?|Here(?:'s| is)(?: the)?(?: response| draft)?[.:]?)\s*/i, '').trim();
    }
    return body;
  };

  const stripAutoResponseWrapper = (value) => {
    const body = text(value || '').replace(/\r\n/g, '\n').trim();
    if (!body) return '';
    const lines = body.split('\n');
    let i = 0;
    while (i < lines.length && !lines[i].trim()) i += 1;
    let changed = false;
    if (/^#\s*(?:응답|response)\s*$/i.test(lines[i]?.trim() || '')) {
      i += 1;
      changed = true;
      while (i < lines.length && !lines[i].trim()) i += 1;
    }
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) { i += 1; changed = true; continue; }
      if (/^#{2,6}\s*(?:볼륨|volume)(?:\s|[:：]|$)/i.test(line)
        || /^#{2,6}\s*(?:챕터|chapter)(?:\s|[:：]|$)/i.test(line)
        || /^#{1,6}\s*Chatindex\s*:/i.test(line)
        || /^⏱️?\s*\[?\d{4}-\d{2}-\d{2}\b/i.test(line)) {
        i += 1;
        changed = true;
        continue;
      }
      break;
    }
    return changed ? lines.slice(i).join('\n').trim() : body;
  };

  const normalizeDraftCandidateText = (value) => stripAutoResponseWrapper(stripHiddenReasoningBlocks(compact(value || '', 80000))).trim();
  const isCompleteDraftText = (value) => isUsableDraftText(value) && hasCompleteDraftEnding(value);

  const bestDraftCandidate = (candidates = []) => {
    const normalized = candidates
      .map(item => ({
        text: normalizeDraftCandidateText(item?.text || ''),
        priority: Number(item?.priority || 0)
      }))
      .filter(item => item.text);
    const usable = normalized.filter(item => isCompleteDraftText(item.text));
    if (!usable.length) return '';
    usable.sort((a, b) => {
      const scoreA = Math.min(a.text.length, 80000) + (a.priority * 250);
      const scoreB = Math.min(b.text.length, 80000) + (b.priority * 250);
      return scoreB - scoreA;
    });
    return usable[0].text;
  };

  const extractStageDraftText = (data, draftObj = {}, finalObj = null, fallbackDraft = '') => bestDraftCandidate([
    { text: responseDraftObjectToText(data?.response_draft), priority: 90 },
    { text: responseDraftObjectToText(data?.full_response_draft), priority: 88 },
    { text: responseDraftObjectToText(data?.final_response_draft), priority: 88 },
    { text: responseDraftObjectToText(data?.final_draft), priority: 86 },
    { text: data?.final_rp_draft, priority: 84 },
    { text: finalObj?.final_rp_draft, priority: 82 },
    { text: draftObj.rp_text, priority: 60 },
    { text: draftObj.response, priority: 58 },
    { text: draftObj.text, priority: 56 },
    { text: data?.rp_text, priority: 54 },
    { text: fallbackDraft, priority: 20 }
  ]);

  const stripMarkdownFences = (value) => {
    let raw = String(value || '').trim();
    raw = raw.replace(/^```(?:json|markdown|md|text)?\s*/i, '').replace(/```\s*$/i, '').trim();
    return raw;
  };

  const cleanupLooseDraftText = (value) => {
    let body = stripMarkdownFences(value)
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim();
    body = body.replace(/^["']+/, '').replace(/["']+\s*[,}\]]?\s*$/g, '').trim();
    body = body.replace(/\n\s*["']?(?:beats|do_not_reveal|pov_limits|notes|draft_kind|change_log|continuity_notes|final_overlay|analysis|edits|schema|stage|ok|thinking|reasoning|reasoning_content|scratchpad)["']?\s*:\s*[\s\S]*$/i, '').trim();
    body = body.replace(/["']\s*,\s*["']?(?:beats|do_not_reveal|pov_limits|notes|draft_kind|change_log|continuity_notes|final_overlay|analysis|edits|schema|stage|ok|thinking|reasoning|reasoning_content|scratchpad)["']?\s*:\s*[\s\S]*$/i, '').trim();
    body = stripHiddenReasoningBlocks(body);
    return compact(body, 80000);
  };

  const extractLooseDraftField = (raw) => {
    const source = stripMarkdownFences(stripCodeFence(raw));
    if (!source) return '';
    const keys = [
      ['response_draft', 90],
      ['full_response_draft', 88],
      ['final_response_draft', 88],
      ['final_rp_draft', 84],
      ['revised_response', 70],
      ['rp_text', 60]
    ];
    const boundaries = 'beats|do_not_reveal|pov_limits|notes|draft_kind|change_log|continuity_notes|final_overlay|analysis|edits|schema|stage|ok|draft|response_requirements|findings|rewrite_required|thinking|reasoning|reasoning_content|scratchpad';
    const candidates = [];
    for (const [key, priority] of keys) {
      const quoted = new RegExp(`["']?${key}["']?\\s*:\\s*(["'])([\\s\\S]*?)(?=\\1\\s*(?:,\\s*["']?(?:${boundaries})["']?\\s*:|[}\\]]))`, 'i');
      const quotedMatch = source.match(quoted);
      if (quotedMatch) {
        const cleaned = cleanupLooseDraftText(quotedMatch[2]);
        if (cleaned.length >= 40) candidates.push({ text: cleaned, priority });
      }
      const loose = new RegExp(`["']?${key}["']?\\s*:\\s*([\\s\\S]{40,}?)(?=\\n\\s*["']?(?:${boundaries})["']?\\s*:|\\n?\\s*[}\\]])`, 'i');
      const looseMatch = source.match(loose);
      if (looseMatch) {
        const cleaned = cleanupLooseDraftText(looseMatch[1]);
        if (cleaned.length >= 40) candidates.push({ text: cleaned, priority: priority - 2 });
      }
      if (!quotedMatch && !looseMatch) {
        const unclosed = new RegExp(`["']?${key}["']?\\s*:\\s*(["'])([\\s\\S]{160,})$`, 'i');
        const unclosedMatch = source.match(unclosed);
        if (unclosedMatch) {
          const cleaned = cleanupLooseDraftText(unclosedMatch[2]);
          if (isUsableDraftText(cleaned) && hasCompleteDraftEnding(cleaned)) candidates.push({ text: cleaned, priority: priority - 8 });
        }
      }
    }
    return bestDraftCandidate(candidates);
  };

  const jsonishToDraftText = (raw) => {
    const extracted = extractLooseDraftField(raw);
    if (extracted) return extracted;
    return '';
  };

  const plainTextDraftCandidate = (raw, fallbackDraft = '') => {
    const extracted = extractLooseDraftField(raw);
    if (extracted) return extracted;
    let candidate = stripMarkdownFences(raw);
    if (!candidate) return '';
    if (/^\s*\{/.test(candidate) && !candidate.includes('# Response') && !candidate.includes('<Thoughts>')) {
      const fromJsonish = jsonishToDraftText(candidate);
      if (fromJsonish) return fromJsonish;
      return '';
    }
    candidate = candidate.replace(/^Here(?:'s| is) (?:the )?(?:revised |final |complete )?(?:draft|response)[:：]\s*/i, '').trim();
    candidate = candidate.replace(/^Of course!?\s*/i, '').trim();
    candidate = stripHiddenReasoningBlocks(candidate);
    candidate = stripAutoResponseWrapper(candidate);
    if (!isCompleteDraftText(candidate)) return isCompleteDraftText(fallbackDraft) ? compact(fallbackDraft, 80000) : '';
    return compact(candidate, 80000);
  };

  const normalizePlainTextFullDraft = (stageName, raw, fallbackDraft = '') => {
    const draftText = plainTextDraftCandidate(raw, fallbackDraft);
    if (!draftText) return null;
    return {
      schema: FULL_DRAFT_STAGE_SCHEMA,
      stage: stageName,
      ok: true,
      analysis: { summary: 'Accepted plain text full draft because strict JSON was not returned.', constraints: [], risks: ['plain_text_fallback'] },
      edits: [],
      draft: { rp_text: draftText, beats: [], do_not_reveal: [], pov_limits: [], notes: ['plain_text_full_draft_fallback'] },
      draft_kind: 'full_response_candidate_plain_text',
      change_log: ['Accepted model output as the full response draft.'],
      final_overlay: null,
      plainTextFallback: true
    };
  };

  const normalizeStageData = (data, stageName, fallbackDraft = '') => {
    if (!data || typeof data !== 'object') return null;
    const draftObj = data.draft && typeof data.draft === 'object' ? data.draft : {};
    const analysisObj = data.analysis && typeof data.analysis === 'object' ? data.analysis : {};
    const finalObj = data.final_overlay && typeof data.final_overlay === 'object' ? data.final_overlay : null;
    const rpText = extractStageDraftText(data, draftObj, finalObj, fallbackDraft);
    const schema = data.schema === FULL_DRAFT_STAGE_SCHEMA ? FULL_DRAFT_STAGE_SCHEMA : STAGE_SCHEMA;
    return {
      schema,
      stage: stageName,
      ok: data.ok !== false,
      analysis: {
        summary: compact(analysisObj.summary || data.summary || '', 1800),
        constraints: normalizeStringArray(analysisObj.constraints || data.constraints, 20, 360),
        risks: normalizeStringArray(analysisObj.risks || data.risks, 20, 360)
      },
      edits: Array.isArray(data.edits) ? data.edits.slice(0, 20).map(edit => {
        if (!edit || typeof edit !== 'object') return { type: 'note', reason: compact(edit, 300), change: '' };
        return {
          type: compact(edit.type || 'edit', 80),
          reason: compact(edit.reason || '', 360),
          change: compact(edit.change || edit.patch || '', 700)
        };
      }) : [],
      draft: {
        rp_text: rpText,
        beats: normalizeStringArray(draftObj.beats || data.beats, 20, 360),
        do_not_reveal: normalizeStringArray(draftObj.do_not_reveal || data.do_not_reveal, 20, 360),
        pov_limits: normalizeStringArray(draftObj.pov_limits || data.pov_limits, 20, 360),
        notes: normalizeStringArray(draftObj.notes || data.notes || data.continuity_notes, 20, 360)
      },
      draft_kind: compact(data.draft_kind || (schema === FULL_DRAFT_STAGE_SCHEMA ? 'full_response_candidate' : ''), 80),
      change_log: normalizeStringArray(data.change_log || data.changelog || [], 20, 700),
      final_overlay: finalObj ? {
        current_scene: compact(finalObj.current_scene || '', 1600),
        character_alignment: compact(finalObj.character_alignment || '', 1600),
        world_alignment: compact(finalObj.world_alignment || '', 1600),
        plot_direction: compact(finalObj.plot_direction || '', 1600),
        final_rp_draft: normalizeDraftCandidateText(finalObj.final_rp_draft || rpText),
        response_requirements: normalizeStringArray(finalObj.response_requirements, 20, 360)
      } : null
    };
  };

  const fallbackStage = (stageName, previous, reason) => {
    const prevDraft = previous?.final_overlay?.final_rp_draft || previous?.draft?.rp_text || '';
    const previousAnalysis = previous?.analysis?.summary || '';
    return {
      schema: STAGE_SCHEMA,
      stage: stageName,
      ok: false,
      fallback: true,
      reason,
      analysis: {
        summary: compact(previousAnalysis || '', 1800),
        constraints: previous?.analysis?.constraints || [],
        risks: previous?.analysis?.risks || []
      },
      edits: [],
      draft: {
        rp_text: compact(prevDraft, 80000),
        beats: previous?.draft?.beats || [],
        do_not_reveal: previous?.draft?.do_not_reveal || [],
        pov_limits: previous?.draft?.pov_limits || [],
        notes: previous?.draft?.notes || []
      },
      final_overlay: null
    };
  };

  const publicStageView = (stage) => {
    if (!stage) return null;
    return {
      schema: stage.schema,
      stage: stage.stage,
      ok: stage.ok,
      fallback: !!stage.fallback,
      reason: stage.reason || '',
      label: stage.label || '',
      analysisOnly: !!stage.analysisOnly,
      summary: stage.summary || stage.analysis?.summary || '',
      constraints: stage.constraints || stage.analysis?.constraints || [],
      risks: stage.risks || stage.analysis?.risks || [],
      notes: stage.notes || stage.draft?.notes || [],
      handoff: stage.handoff || '',
      analysis: stage.analysis || {},
      twoCallAnalysis: stage.twoCallAnalysis || null,
      edits: stage.edits || [],
      draft: stage.draft || {},
      draft_kind: stage.draft_kind || '',
      change_log: stage.change_log || [],
      final_overlay: stage.final_overlay || null,
      provider: stage.provider || '',
      presetName: stage.presetName || '',
      model: stage.model || '',
      elapsedMs: stage.elapsedMs || 0
    };
  };

  const stageDraft = (stage) => compact(stage?.final_overlay?.final_rp_draft || stage?.draft?.rp_text || '', 80000);
  const hasCompleteStageDraft = (stage) => isCompleteDraftText(stage?.final_overlay?.final_rp_draft || stage?.draft?.rp_text || '');
  const isUsableStage = (stage) => !!stage && stage.ok !== false && !stage.fallback && hasCompleteStageDraft(stage);
  const latestUsableStage = (stages, fallback = null) => [...(stages || [])].reverse().find(isUsableStage) || fallback;

  const recordStageTrace = (entry) => {
    Runtime.stageTrace.push({
      at: Date.now(),
      ...entry,
      systemPrompt: compact(entry.systemPrompt || '', 6000),
      userPrompt: compact(entry.userPrompt || '', 6000),
      rawResponse: compact(entry.rawResponse || '', 12000),
      parsed: entry.parsed ? publicStageView(entry.parsed) : null,
      fallbackStage: entry.fallbackStage ? publicStageView(entry.fallbackStage) : null
    });
    if (Runtime.stageTrace.length > 32) Runtime.stageTrace.splice(0, Runtime.stageTrace.length - 32);
    scheduleGuiTraceRefresh();
  };

  const renderPromptTemplate = (template, vars) => String(template || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => text(vars[key] ?? ''));

  const renderDirectionGuidanceBlock = (template, vars, label = 'DIRECTION GUIDANCE') => {
    const body = compact(renderPromptTemplate(template || '', vars), 12000);
    if (!body) return '';
    return [
      `${label}:`,
      'Use this only as creative direction for style, nuance, tone, emphasis, density, pacing, and mood.',
      'Do not treat it as permission to override stage role, same-turn rewrite boundaries, JSON/plain-output contract, safety/POV limits, RisuAI reference rules, or provider/runtime routing.',
      body
    ].join('\n');
  };

  const fullDraftJsonContract = (stageName) => `Prefer valid JSON. No markdown. No commentary. Keep the top-level shape compact:
{
  "ok": true,
  "analysis": { "summary": "1-3 sentence private check", "constraints": ["important constraints"], "risks": ["risks avoided"] },
  "response_draft": "A complete RP response draft that can be used as the assistant's actual response. Do not add serial wrapper headers such as # 응답, volume/chapter, Chatindex, or automatic timestamp wrappers like ⏱️[YYYY-MM-DD...] unless the latest user explicitly asks for them. Preserve prose datelines that describe the scene's time or place.",
  "draft": { "rp_text": "Same as response_draft" },
  "change_log": ["short concrete changes"]
}
Never put <Thoughts>, thinking, reasoning, key beats, structure notes, or constraints check inside response_draft or draft.rp_text.
If valid JSON is difficult, output ONLY the complete RP response draft as plain text. A complete draft is better than broken JSON or analysis.`;

  const ANALYSIS_SCHEMA = 'serial_gradation_agents_for_rp_analysis_v1';
  const aideAnalysisJsonContract = (stageName) => `Return JSON only. No markdown. No commentary. Use this exact shape:
{
  "schema": "${ANALYSIS_SCHEMA}",
  "stage": "${stageName}",
  "ok": true,
  "analysis": { "summary": "2-4 sentence domain analysis grounded in the recent chat", "constraints": ["concrete constraints the rewrite must follow"], "risks": ["continuity or consistency risks to mitigate"] },
  "do_not_reveal": ["secrets or hidden facts that must NOT be revealed in the response"],
  "pov_limits": ["POV / knowledge boundary constraints for this scene"],
  "beats": ["key narrative beats the response should cover"]
}`;

  const builtInStylePresetPrompt = () => [
    '- Work as a serial RP draft writer/editor, not as an analyst.',
    '- Every beforeRequest writing stage must return a complete, usable RP response draft, not a plan, summary, scene memo, scaffold, or hidden reasoning.',
    '- When a previous draft exists, rewrite that same response candidate directly. Improve and expand it inside the same turn boundary instead of continuing after it.',
    '- Start from the latest user input and preserve the latest visible scene, location, time, social situation, and response boundary unless the user clearly moves them.',
    '- Do not automatically add serial wrapper headers such as # 응답, volume/chapter titles, Chatindex, or automatic timestamp wrappers like ⏱️[YYYY-MM-DD...]. Start with the actual RP prose unless the latest user explicitly asks for those wrappers.',
    '- Preserve prose datelines that carry scene time/place, such as "밤 10:20 PM, 시끌벅적한 고기집의 한구석."; those are story text, not removable headers.',
    '- Keep functional obligations such as image-command rules, language requirements, and status/interface blocks only when they are explicitly required by the active chat rules.',
    '- Make the scene feel alive through concrete behavior, small physical reactions, dialogue rhythm, social timing, sensory detail, and character-specific choices.',
    '- Let dialogue and action create motion before narration explains it. Avoid generic drama, empty abstraction, fake foreshadowing, formulaic endings, and inflated dramatic phrasing.',
    '- Use profiles, lore, persona, memory, and Others Info only as private writing fuel. Do not recite profile fields, leak secrets, or narrate knowledge unavailable to the current viewpoint.',
    '- Preserve user agency. Do not decide the user character hidden thoughts, feelings, choices, or dialogue unless the user already provided them.',
    '- Maintain grounded continuity. Visible causes should lead to visible effects, physical and social constraints should stay active, and bystanders or public context should not vanish.',
    '- Expand weak parts only when it improves the current response. Do not bloat, derail, skip ahead, or replace the current scene with a different next beat.',
    '- Never output <Thoughts>, thinking, reasoning, key beats, structure notes, constraints checks, stage names, JSON labels, or plugin terminology inside the draft.'
  ].join('\n');

  const shadowActDraftStyleBridgePrompt = () => [
    '- The first stage must write the first playable RP response draft, not a neutral scaffold or preparation note.',
    '- Start the actual RP continuation immediately from the latest user input, while obeying the current response format and scene boundary.',
    '- The first draft should already contain dialogue, small physical reactions, social timing, concrete behavior, and enough scene substance for later agents to refine.',
    '- Use character, persona, lore, and memory as hidden writing fuel, but never turn them into profile exposition.',
    '- Later agents may polish, tighten, and expand the draft, but they should not need to invent the playable response from zero.'
  ].join('\n');

  const fullDraftStageRoleInstructions = (stageName) => ({
    shadow_act: [
      'ROLE: SHADOW ACT — first full-response drafter.',
      'Write the first complete RP response draft for the current turn from scratch.',
      'Use RisuAI character/persona/lore context privately if present, but keep the latest visible scene locked.',
      'This draft is the seed every later AIDE will revise; make it a complete, playable response, not a plan.',
      'The first draft must already contain vivid dialogue-first momentum and human behavioral texture; later AIDEs refine it, but they must not be required to invent the playable response.'
    ],
    aide_character: [
      'ROLE: Character AIDE — full-response character rewriter.',
      'Read the previous agent draft, then rewrite the whole draft so character behavior, speech, relationships, secrets, POV, and user agency are aligned.',
      'This is same-turn revision, not a new continuation. Preserve the previous draft response boundary and polish/expand inside it.',
      'Do not output analysis as the result. Output a revised response_draft.'
    ],
    aide_world: [
      'ROLE: World AIDE — full-response world and continuity rewriter.',
      'Read the previous agent draft, then rewrite the whole draft so setting, time, social context, physical constraints, lore/world rules, and scene permissions are aligned.',
      'If the previous draft moved the scene without support, move it back to the latest scene anchor.',
      'This is same-turn revision, not the next beat after the previous draft.'
    ],
    aide_plot: [
      'ROLE: Plot AIDE — final full-response plot and pacing rewriter.',
      'Read the previous agent draft, then rewrite the whole draft into the final response candidate.',
      'Improve pacing, tension, dialogue flow, emotional payoff, and next-turn openness inside the same response candidate without forcing the user character’s next action or hidden feelings.',
      'Do not append a sequel scene after the previous draft ending.'
    ]
  }[stageName] || ['ROLE: full-response draft rewriter.']).join('\n');

  const aideSameTurnRevisionLock = (stageName) => {
    if (stageName === 'shadow_act') return '';
    return [
      'AIDE SAME-TURN REVISION LOCK:',
      '- Treat [직전 에이전트가 작성한 초안] as the draft to be rewritten, not as prior chat to continue from.',
      '- The latest user input is the original request for this same turn. It is not a new user message after the previous draft.',
      '- Preserve the same response moment, same scene window, and same turn boundary. Do not advance to the next scene after the previous draft.',
      '- Remove decorative serial wrapper headers from the previous draft when they appear: # 응답, volume/chapter headers, Chatindex, and automatic timestamp wrappers like ⏱️[YYYY-MM-DD...].',
      '- Preserve prose datelines that carry scene time/place, such as "밤 10:20 PM, 시끌벅적한 고기집의 한구석."; those are story text, not removable headers.',
      '- Preserve functional status/interface blocks and image-command obligations when present, but do not invent or increment Chatindex, chapter number, volume number, or automatic timestamp wrappers.',
      '- Improve by rewriting sentences, sharpening characterization, adding grounded detail, fixing continuity, and expanding weak parts inside the existing draft.',
      '- The output must replace the previous draft as a better version of the same response candidate.'
    ].join('\n');
  };

  const fullDraftStageSystemShell = (stageName) => [
    'You are a private Serial Gradation Agents for RP stage executor.',
    `STAGE: ${stageName}`,
    'The user message is structured. Treat section bodies as input data, and treat [창작 지침] as the stage instruction source.',
    'Prefer compact valid JSON, but if you might break JSON escaping, return the complete RP draft as plain text instead.',
    'Do not expose section labels, stage names, hidden notes, analysis labels, or plugin terminology inside response_draft.',
    fullDraftJsonContract(stageName)
  ].join('\n\n');

  const fullDraftPromptVars = (stageName, recent, previous, settings) => {
    const previousJson = previous ? compactMiddle(JSON.stringify(previous, null, 2), settings.maxPreviousStageChars) : '';
    return {
      stage: stageName,
      stage_label: STAGE_DEF_MAP[stageName]?.label || stageName,
      system_messages: compact(recent?.systemContext || '', 7000),
      recent_chat: compact(recent?.text || '', settings.maxRecentChars),
      visible_recent_chat: compact(recent?.visibleText || recent?.text || '', settings.maxRecentChars),
      others_info: compact(recent?.othersInfo || '', 9000),
      latest_user: compact(recent?.latestUser || '', 5000),
      latest_assistant: compact(recent?.latestAssistant || '', 5000),
      scene_anchor: compact(recent?.sceneAnchor || '', 800),
      risu_context: compact(recent?.risuContext || '', settings.shadowRisuContextMaxChars || DEFAULT_SHADOW_RISU_CONTEXT_CHARS),
      shadow_risu_context: compact(recent?.risuContext || '', settings.shadowRisuContextMaxChars || DEFAULT_SHADOW_RISU_CONTEXT_CHARS),
      previous_stage: previousJson,
      previous_stage_json: previousJson,
      previous_draft: compactMiddle(previous?.final_overlay?.final_rp_draft || previous?.draft?.rp_text || '', settings.maxPreviousStageChars),
      full_draft_contract: fullDraftJsonContract(stageName),
      json_contract: fullDraftJsonContract(stageName)
    };
  };

  const defaultFullDraftCreativeInstructions = (stageName, recent, previous, settings, ledger, extraBlock = '') => {
    const stylePack = builtInStylePresetPrompt(settings);
    const shadowDraftBridge = stageName === 'shadow_act' ? shadowActDraftStyleBridgePrompt(settings) : '';
    const sameTurnLock = aideSameTurnRevisionLock(stageName);
    const vars = fullDraftPromptVars(stageName, recent, previous, settings);
    const sceneAnchor = recent.sceneAnchor ? `LATEST SCENE ANCHOR FROM LAST STATUS LINE:\n${recent.sceneAnchor}` : 'LATEST SCENE ANCHOR FROM LAST STATUS LINE:\n(none found; infer cautiously from recent assistant output)';
    const lengthGuide = `TARGET DRAFT LENGTH: ${settings.targetDraftMinChars || DEFAULT_TARGET_DRAFT_MIN_CHARS}-${settings.targetDraftMaxChars || DEFAULT_TARGET_DRAFT_MAX_CHARS} characters. Do not produce a very short stub or an excessively long wall of text.`;
    const constraintBlock = stageName === 'shadow_act' ? '' : buildConstraintBlock(ledger);
    const stageExtra = settings.beforeExtraPrompts?.[stageName]
      ? renderDirectionGuidanceBlock(settings.beforeExtraPrompts[stageName], vars, 'USER DIRECTION ADDENDUM')
      : '';
    return [
      stylePack,
      shadowDraftBridge,
      sameTurnLock,
      sceneAnchor,
      lengthGuide,
      'Use the structured input sections in priority order. Do not treat lore, Others Info, or prior analysis as dialogue to quote.',
      'If the latest user input does not explicitly move the scene, preserve the latest visible location and social situation.',
      'response_draft must contain the actual draft text, not analysis.',
      fullDraftStageRoleInstructions(stageName),
      constraintBlock,
      extraBlock,
      stageExtra
    ].filter(Boolean).join('\n\n');
  };

  const resolveFullDraftCreativeInstructions = (stageName, recent, previous, settings, ledger, extraBlock = '') => {
    const custom = settings.beforeCustomPrompts?.[stageName] || '';
    const mode = settings.beforePromptModes?.[stageName] || 'builtin';
    const vars = fullDraftPromptVars(stageName, recent, previous, settings);
    const directionBlock = mode === 'replace' && custom
      ? renderDirectionGuidanceBlock(custom, vars, 'USER CREATIVE DIRECTION GUIDANCE')
      : '';
    return defaultFullDraftCreativeInstructions(
      stageName,
      recent,
      previous,
      settings,
      ledger,
      [extraBlock, directionBlock].filter(Boolean).join('\n\n')
    );
  };

  const buildShadowActDraftUserPrompt = (recent, settings, creativeInstructions) => {
    const systemContext = recent.systemContext || '(별도 시스템/개발자 메시지 없음)';
    const recentChat = recent.visibleText || recent.text || '(최근 RP 대화 없음)';
    const lorebookContext = recent.risuContext || '(활성 로어북/캐릭터/페르소나 참조 없음 또는 접근 불가)';
    const othersInfo = recent.othersInfo || '(Others Info / 보조 패킷 없음)';
    return [
      '[시스템 메시지]',
      systemContext,
      '',
      `[최근 챗 ${recent.visibleMessageCount || 0}개]`,
      recentChat,
      '',
      '[로어북 / 캐릭터 / 페르소나 참조]',
      lorebookContext,
      '',
      '[Others Info / 보조 패킷]',
      othersInfo,
      '',
      '[창작 지침]',
      creativeInstructions || '(창작 지침 없음)',
      '',
      '[유저 인풋]',
      recent.latestUser || '(최신 유저 입력 없음)',
      '',
      '위 정보 우선순위를 따라 첫 번째 complete RP response_draft를 지금 작성하라.'
    ].join('\n');
  };

  const buildAideDraftUserPrompt = (stageName, recent, previous, settings, creativeInstructions) => {
    const systemContext = recent.systemContext || '(별도 시스템/개발자 메시지 없음)';
    const previousDraft = stageDraft(previous) || '(직전 에이전트 초안 없음)';
    const previousChat = recent.visibleText || recent.text || '(이전 챗 없음)';
    return [
      '[시스템 메시지]',
      systemContext,
      '',
      '[직전 에이전트가 작성한 초안 / 이번 단계의 재작성 대상]',
      compactMiddle(previousDraft, settings.maxPreviousStageChars),
      '',
      `[이전 챗 ${recent.visibleMessageCount || 0}개 / 사실 검증 및 말투 참조용]`,
      previousChat,
      '',
      '[RISUAI 비공개 참조]',
      recent.risuContext || '(이 단계에서 RisuAI 참조를 사용하지 않음)',
      '',
      '[창작 지침]',
      creativeInstructions || '(창작 지침 없음)',
      '',
      '[유저 인풋]',
      recent.latestUser || '(최신 유저 입력 없음)',
      '',
      [
        `${STAGE_DEF_MAP[stageName]?.label || stageName} 단계로 직전 초안을 같은 턴의 더 나은 complete RP response_draft로 전체 재작성하라.`,
        '새 다음 전개를 이어 쓰지 말고, 직전 초안의 장면 범위 안에서 문장·대사·행동·정보 배치를 가다듬고 필요한 부분만 확장하라.',
        '직전 초안에 상태창/이미지 명령 형식이 있으면 유지하되, # 응답/볼륨/챕터/Chatindex/자동 타임스탬프 래퍼(예: ⏱️[YYYY-MM-DD...])는 최신 유저가 명시적으로 요구하지 않는 한 제거하라. 단, "밤 10:20 PM, 시끌벅적한 고기집의 한구석."처럼 시간과 장소를 서술하는 장면 도입문은 본문이므로 보존하라.'
      ].join('\n')
    ].join('\n');
  };

  const buildConstraintBlock = (ledger) => {
    if (!ledger) return '';
    const parts = [];
    if (ledger.character?.analysis?.summary) parts.push(`[CHARACTER ANALYSIS from Character AIDE]\n${ledger.character.analysis.summary}`);
    if (ledger.character?.doNotReveal?.length) parts.push(`DO NOT REVEAL (from Character AIDE):\n- ${ledger.character.doNotReveal.join('\n- ')}`);
    if (ledger.character?.povLimits?.length) parts.push(`POV LIMITS (from Character AIDE):\n- ${ledger.character.povLimits.join('\n- ')}`);
    if (ledger.world?.analysis?.summary) parts.push(`[WORLD ANALYSIS from World AIDE]\n${ledger.world.analysis.summary}`);
    if (ledger.world?.constraints?.length) parts.push(`WORLD CONSTRAINTS (from World AIDE):\n- ${ledger.world.constraints.join('\n- ')}`);
    if (Array.isArray(ledger.customAnalyses) && ledger.customAnalyses.length) {
      const customBlocks = ledger.customAnalyses.slice(-12).map((item, index) => {
        const label = compact(item?.label || item?.stage || `analysis_${index + 1}`, 80);
        const lines = [];
        if (item?.summary) lines.push(`Summary: ${compact(item.summary, 1200)}`);
        if (item?.constraints?.length) lines.push(`Constraints:\n- ${item.constraints.map(x => compact(x, 360)).join('\n- ')}`);
        if (item?.risks?.length) lines.push(`Risks:\n- ${item.risks.map(x => compact(x, 360)).join('\n- ')}`);
        if (item?.notes?.length) lines.push(`Notes:\n- ${item.notes.map(x => compact(x, 360)).join('\n- ')}`);
        if (item?.handoff) lines.push(`Handoff: ${compact(item.handoff, 1000)}`);
        return lines.length ? `[CUSTOM ANALYSIS: ${label}]\n${lines.join('\n')}` : '';
      }).filter(Boolean);
      if (customBlocks.length) parts.push(`CUSTOM ANALYSIS AGENTS — use as private constraints for the next rewrite:\n${customBlocks.join('\n\n')}`);
    }
    return parts.length ? `INHERITED CONSTRAINTS FROM PRIOR STAGES — preserve these in your revision:\n${parts.join('\n\n')}` : '';
  };

  const extractAnalysisFromStage = (stage) => {
    if (!stage) return null;
    const analysis = stage.analysis || {};
    const draft = stage.draft || {};
    return {
      analysis: { summary: analysis.summary || '', constraints: analysis.constraints || [], risks: analysis.risks || [] },
      doNotReveal: draft.do_not_reveal || stage.do_not_reveal || [],
      povLimits: draft.pov_limits || stage.pov_limits || [],
      beats: draft.beats || stage.beats || [],
      constraints: analysis.constraints || []
    };
  };

  const aideAnalysisPrompt = (stageName, recent, previous, settings, ledger) => {
    const stylePack = builtInStylePresetPrompt(settings);
    const sceneAnchor = recent.sceneAnchor ? `LATEST SCENE ANCHOR FROM LAST STATUS LINE:\n${recent.sceneAnchor}` : 'LATEST SCENE ANCHOR FROM LAST STATUS LINE:\n(none found; infer cautiously from recent assistant output)';
    const constraintBlock = buildConstraintBlock(ledger);
    const common = [
      'You are a private RP analysis stage inside Serial Gradation Agents for RP.',
      stylePack,
      sceneAnchor,
      'Use only the recent chat, latest user input, and provided private RisuAI context as evidence.',
      'Analyze the domain thoroughly. Your analysis will be used as explicit constraints for the rewrite phase.',
      stageName === 'shadow_act'
        ? 'For SHADOW ACT, analyze what the first same-turn draft should contain.'
        : 'For AIDE stages, analyze how to improve the CURRENT DRAFT as the same-turn response. Do not plan the next scene after it.'
    ].join('\n\n');
    const roleLines = {
      shadow_act: [
        'ROLE: SHADOW ACT — analysis phase before first-draft writing.',
        'Analyze the latest visible scene, active character/persona constraints, user intent, continuity anchors, and a safe open-ended response direction.',
        'Identify secrets, POV limits, and scene locks that the first draft must preserve.',
        'Do not write the response draft in this call. Only produce the analysis.'
      ],
      aide_character: [
        'ROLE: Character AIDE — analysis phase.',
        'Analyze each visible character from the recent chat: identity, psychology, role, behavior pattern, secrets, POV, and knowledge boundaries.',
        'Identify what must NOT be revealed yet (do_not_reveal) and what POV/knowledge limits apply (pov_limits).',
        'Focus on what to repair or enrich inside the current draft; do not suggest a continuation after the draft.',
        'Do not write or revise the response draft. Only produce the analysis.'
      ],
      aide_world: [
        'ROLE: World AIDE — analysis phase.',
        'Analyze and define the current setting from the recent chat: location, time, social context, physical constraints, lore/world rules, and scene permissions.',
        'Identify world constraints the rewrite must follow.',
        'Focus on same-scene consistency inside the current draft; do not move time, chapter, or location forward unless repairing an unsupported move.',
        'Do not write or revise the response draft. Only produce the analysis.'
      ],
      aide_plot: [
        'ROLE: Plot AIDE — analysis phase.',
        'Analyze the current plot state from the recent chat and the current draft: unresolved tension, pacing, emotional payoff, and next-turn openness within this same response.',
        'Identify key narrative beats the rewritten draft should cover without adding a sequel scene after the current draft ending.',
        'Do not write or revise the response draft. Only produce the analysis.'
      ]
    }[stageName] || ['ROLE: analysis phase.'];
    const extra = settings.beforeExtraPrompts?.[stageName]
      ? renderDirectionGuidanceBlock(settings.beforeExtraPrompts[stageName], fullDraftPromptVars(stageName, recent, previous, settings), 'USER DIRECTION ADDENDUM')
      : '';
    const userParts = ['RECENT CHAT (reference only):', recent.text, '', 'LATEST USER INPUT (original request for the same turn):', recent.latestUser, ''];
    if (recent.risuContext) userParts.push('PRIVATE RISUAI CONTEXT:', recent.risuContext, '');
    const previousDraft = stageDraft(previous);
    if (previousDraft) userParts.push('CURRENT DRAFT TO ANALYZE AND IMPROVE IN-PLACE:', compactMiddle(previousDraft, settings.maxPreviousStageChars), '');
    if (constraintBlock) userParts.push(constraintBlock, '');
    userParts.push(`Run ${stageName} analysis now.`);
    return {
      system: [common, roleLines.join('\n'), extra, aideAnalysisJsonContract(stageName)].filter(Boolean).join('\n\n'),
      user: userParts.join('\n')
    };
  };

  const aideRewritePrompt = (stageName, recent, previous, settings, analysis, ledger = {}) => {
    const analysisBlock = analysis ? [
      'DOMAIN ANALYSIS (use as explicit constraints for your rewrite):',
      analysis.analysis?.summary ? `Summary: ${analysis.analysis.summary}` : '',
      analysis.analysis?.constraints?.length ? `Constraints:\n- ${analysis.analysis.constraints.join('\n- ')}` : '',
      analysis.doNotReveal?.length ? `DO NOT REVEAL:\n- ${analysis.doNotReveal.join('\n- ')}` : '',
      analysis.povLimits?.length ? `POV LIMITS:\n- ${analysis.povLimits.join('\n- ')}` : '',
      analysis.beats?.length ? `NARRATIVE BEATS TO COVER INSIDE THE SAME REWRITTEN DRAFT:\n- ${analysis.beats.join('\n- ')}` : '',
      stageName === 'shadow_act' ? '' : 'SAME-TURN REMINDER: these constraints are for rewriting the previous draft in-place, not for writing the next scene.'
    ].filter(Boolean).join('\n') : '';
    const creativeInstructions = resolveFullDraftCreativeInstructions(stageName, recent, previous, settings, ledger, analysisBlock);
    return {
      system: fullDraftStageSystemShell(stageName),
      user: stageName === 'shadow_act'
        ? buildShadowActDraftUserPrompt(recent, settings, creativeInstructions)
        : buildAideDraftUserPrompt(stageName, recent, previous, settings, creativeInstructions)
    };
  };

  const fullDraftStagePrompt = (stageName, recent, previous, settings, ledger) => {
    const creativeInstructions = resolveFullDraftCreativeInstructions(stageName, recent, previous, settings, ledger);
    if (stageName === 'shadow_act') {
      return {
        system: fullDraftStageSystemShell(stageName),
        user: buildShadowActDraftUserPrompt(recent, settings, creativeInstructions)
      };
    }
    return {
      system: fullDraftStageSystemShell(stageName),
      user: buildAideDraftUserPrompt(stageName, recent, previous, settings, creativeInstructions)
    };
  };

  const builtInStagePrompt = (stageName, recent, previous, settings, ledger) => fullDraftStagePrompt(stageName, recent, previous, settings, ledger);

  const stagePrompt = (stageName, recent, previous, settings, ledger) => {
    return builtInStagePrompt(stageName, recent, previous, settings, ledger);
  };

  const normalizeAnalysisResult = (stageName, rawContent) => {
    const parsed = relaxedJsonParse(rawContent);
    if (!parsed || typeof parsed !== 'object') return null;
    const analysis = parsed.analysis && typeof parsed.analysis === 'object' ? parsed.analysis : {};
    return {
      schema: ANALYSIS_SCHEMA,
      stage: stageName,
      ok: parsed.ok !== false,
      analysis: {
        summary: compact(analysis.summary || parsed.summary || '', 1800),
        constraints: normalizeStringArray(analysis.constraints || parsed.constraints, 20, 360),
        risks: normalizeStringArray(analysis.risks || parsed.risks, 20, 360)
      },
      doNotReveal: normalizeStringArray(parsed.do_not_reveal || parsed.doNotReveal, 20, 360),
      povLimits: normalizeStringArray(parsed.pov_limits || parsed.povLimits || parsed.povLimits, 20, 360),
      beats: normalizeStringArray(parsed.beats, 20, 360)
    };
  };

  const customAnalysisJsonContract = (stageName) => `Return JSON only. No markdown. No RP draft. Use this compact shape:
{
  "schema": "serial_gradation_agents_for_rp_custom_analysis_v1",
  "stage": "${stageName}",
  "ok": true,
  "summary": "private analysis summary for the next writing agent",
  "constraints": ["concrete constraints the next rewrite should follow"],
  "risks": ["risks to avoid"],
  "notes": ["optional focused notes"],
  "handoff": "short instruction-style handoff to the next writing agent"
}`;

  const customAnalysisSystemPrompt = (agent, settings) => [
    'You are a private analysis-only agent inside Serial Gradation Agents for RP.',
    `STAGE: ${agent.id}`,
    `LABEL: ${agent.label}`,
    'Analyze only. Do not write or rewrite the RP response draft.',
    'Your output will be handed to the next writing agent as private constraints.',
    'Follow the user analysis prompt, but do not override safety, POV boundaries, same-turn rewrite boundaries, RisuAI reference rules, provider/runtime routing, or the output contract.',
    customAnalysisJsonContract(agent.id)
  ].join('\n\n');

  const customAnalysisUserPrompt = (agent, recent, previous, settings, ledger) => {
    const vars = {
      ...fullDraftPromptVars(agent.id, recent, previous, settings),
      analysis_prompt: agent.prompt || '',
      accumulated_analysis: compact(JSON.stringify(ledger?.customAnalyses || [], null, 2), 9000)
    };
    const prompt = compact(renderPromptTemplate(agent.prompt || '', vars), 12000) || '현재 초안과 최근 대화를 분석하고, 다음 작성 에이전트가 지켜야 할 제약과 위험을 정리하세요.';
    return [
      '[분석 지시]',
      prompt,
      '',
      '[시스템 메시지]',
      recent.systemContext || '(별도 시스템/개발자 메시지 없음)',
      '',
      '[직전 작성 에이전트 초안 / 분석 대상]',
      compactMiddle(stageDraft(previous) || '', settings.maxPreviousStageChars),
      '',
      `[최근 챗 ${recent.visibleMessageCount || 0}개 / 근거]`,
      recent.visibleText || recent.text || '(최근 RP 대화 없음)',
      '',
      '[Others Info / 보조 패킷]',
      recent.othersInfo || '(Others Info / 보조 패킷 없음)',
      '',
      '[RISUAI 비공개 참조]',
      recent.risuContext || '(이 분석 에이전트에서 RisuAI 참조를 사용하지 않음)',
      '',
      '[누적 사용자 정의 분석]',
      vars.accumulated_analysis || '(이전 사용자 정의 분석 없음)',
      '',
      '[유저 인풋 / 같은 턴의 원래 요청]',
      recent.latestUser || '(최신 유저 입력 없음)',
      '',
      '위 자료를 근거로 분석만 수행하고 JSON으로 반환하라. RP 본문을 작성하지 마라.'
    ].join('\n');
  };

  const normalizeCustomAnalysisResult = (agent, rawContent) => {
    const parsed = relaxedJsonParse(rawContent);
    const analysis = parsed?.analysis && typeof parsed.analysis === 'object' ? parsed.analysis : {};
    const analysisText = typeof parsed?.analysis === 'string' ? parsed.analysis : '';
    if (parsed && typeof parsed === 'object') {
      const summary = compact(parsed.summary || analysis.summary || analysisText || parsed.handoff || '', 1800);
      const constraints = normalizeStringArray(parsed.constraints || analysis.constraints, 24, 420);
      const risks = normalizeStringArray(parsed.risks || analysis.risks, 24, 420);
      const notes = normalizeStringArray(parsed.notes || parsed.beats || parsed.findings || analysis.notes, 24, 420);
      const handoff = compact(parsed.handoff || parsed.next_writer_handoff || parsed.instruction || '', 1200);
      if (summary || constraints.length || risks.length || notes.length || handoff) {
        return {
          schema: 'serial_gradation_agents_for_rp_custom_analysis_v1',
          stage: agent.id,
          label: agent.label,
          ok: parsed.ok !== false,
          analysisOnly: true,
          summary,
          constraints,
          risks,
          notes,
          handoff,
          analysis: { summary, constraints, risks },
          draft: { rp_text: '', notes }
        };
      }
    }
    const raw = compact(rawContent, 6000);
    if (!raw) return null;
    return {
      schema: 'serial_gradation_agents_for_rp_custom_analysis_v1',
      stage: agent.id,
      label: agent.label,
      ok: true,
      analysisOnly: true,
      summary: raw,
      constraints: [],
      risks: [],
      notes: ['plain_text_analysis_fallback'],
      handoff: raw,
      analysis: { summary: raw, constraints: [], risks: [] },
      draft: { rp_text: '', notes: ['plain_text_analysis_fallback'] }
    };
  };

  const analysisLedgerEntry = (result) => result ? {
    stage: result.stage,
    label: result.label || result.stage,
    summary: result.summary || result.analysis?.summary || '',
    constraints: result.constraints || result.analysis?.constraints || [],
    risks: result.risks || result.analysis?.risks || [],
    notes: result.notes || result.draft?.notes || [],
    handoff: result.handoff || ''
  } : null;

  const runCustomAnalysisAgent = async (agent, recent, previous, settings, ledger) => {
    if (!agent?.enabled) return null;
    const startedAt = Date.now();
    const system = customAnalysisSystemPrompt(agent, settings);
    const user = customAnalysisUserPrompt(agent, recent, previous, settings, ledger);
    try {
      const result = await callLLMWithPreset(settings, agent.id, system, user);
      if (!result.ok) {
        const fb = {
          schema: 'serial_gradation_agents_for_rp_custom_analysis_v1',
          stage: agent.id,
          label: agent.label,
          ok: false,
          fallback: true,
          reason: result.reason || 'llm_failed',
          analysisOnly: true,
          summary: '',
          constraints: [],
          risks: [],
          notes: [],
          handoff: '',
          draft: { rp_text: '' },
          elapsedMs: Date.now() - startedAt
        };
        recordStageTrace({ stage: agent.id, ok: false, reason: fb.reason, provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: fb.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: result.content || result.raw || '', parsed: fb });
        return fb;
      }
      const normalized = normalizeCustomAnalysisResult(agent, result.content);
      if (!normalized) {
        const fb = {
          schema: 'serial_gradation_agents_for_rp_custom_analysis_v1',
          stage: agent.id,
          label: agent.label,
          ok: false,
          fallback: true,
          reason: 'analysis_parse_failed',
          analysisOnly: true,
          draft: { rp_text: '' },
          elapsedMs: result.elapsedMs || (Date.now() - startedAt)
        };
        recordStageTrace({ stage: agent.id, ok: false, reason: fb.reason, provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: fb.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: result.content || '', parsed: fb });
        return fb;
      }
      normalized.provider = result.provider;
      normalized.presetName = result.presetName;
      normalized.model = result.model;
      normalized.elapsedMs = result.elapsedMs || (Date.now() - startedAt);
      recordStageTrace({ stage: agent.id, ok: normalized.ok !== false, reason: '', provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: normalized.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: result.content || '', parsed: normalized });
      return normalized;
    } catch (error) {
      warn(`${agent.id}_analysis_failed`, error);
      if (settings.failureMode === 'hard') throw error;
      const fb = {
        schema: 'serial_gradation_agents_for_rp_custom_analysis_v1',
        stage: agent.id,
        label: agent.label,
        ok: false,
        fallback: true,
        reason: compact(error?.message || error, 400),
        analysisOnly: true,
        draft: { rp_text: '' },
        elapsedMs: Date.now() - startedAt
      };
      recordStageTrace({ stage: agent.id, ok: false, reason: fb.reason, elapsedMs: fb.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: '', parsed: fb });
      return fb;
    }
  };

  const runStage = async (stageName, recent, previous, settings, ledger) => {
    const prompts = stagePrompt(stageName, recent, previous, settings, ledger);
    const fallbackDraft = stageDraft(previous);
    const startedAt = Date.now();
    try {
      let result = await callLLMWithPreset(settings, stageName, prompts.system, prompts.user);
      if (!result.ok) {
        const fb = fallbackStage(stageName, previous, result.reason || 'llm_failed');
        fb.elapsedMs = Date.now() - startedAt;
        recordStageTrace({ stage: stageName, ok: false, reason: fb.reason, provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: fb.elapsedMs, systemPrompt: prompts.system, userPrompt: prompts.user, rawResponse: result.content || result.raw || '', fallbackStage: fb });
        return fb;
      }
      let parsed = relaxedJsonParse(result.content);
      let normalized = normalizeStageData(parsed, stageName, fallbackDraft);
      if (!hasCompleteStageDraft(normalized)) {
        normalized = normalizePlainTextFullDraft(stageName, result.content, fallbackDraft);
      }
      if (!hasCompleteStageDraft(normalized)) {
        const retried = await retryJsonParse(settings, stageName, prompts, result.content, startedAt, fallbackDraft);
        if (retried) {
          result = retried.result;
          parsed = retried.parsed;
          normalized = retried.normalized;
        }
      }
      if (!hasCompleteStageDraft(normalized)) {
        const fb = fallbackStage(stageName, previous, 'invalid_or_incomplete_draft');
        fb.provider = result.provider;
        fb.presetName = result.presetName;
        fb.model = result.model;
        fb.elapsedMs = result.elapsedMs || (Date.now() - startedAt);
        recordStageTrace({ stage: stageName, ok: false, reason: 'invalid_or_incomplete_draft', provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: fb.elapsedMs, systemPrompt: prompts.system, userPrompt: prompts.user, rawResponse: result.content || '', parsed: normalized, fallbackStage: fb });
        return fb;
      }
      normalized.provider = result.provider;
      normalized.presetName = result.presetName;
      normalized.model = result.model;
      normalized.elapsedMs = result.elapsedMs || (Date.now() - startedAt);
      recordStageTrace({ stage: stageName, ok: true, reason: '', provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: normalized.elapsedMs, systemPrompt: prompts.system, userPrompt: prompts.user, rawResponse: result.content || '', parsed: normalized });
      return normalized;
    } catch (error) {
      warn(`${stageName}_failed`, error);
      if (settings.failureMode === 'hard') throw error;
      const fb = fallbackStage(stageName, previous, compact(error?.message || error, 300));
      fb.elapsedMs = Date.now() - startedAt;
      recordStageTrace({ stage: stageName, ok: false, reason: fb.reason, elapsedMs: fb.elapsedMs, systemPrompt: prompts.system, userPrompt: prompts.user, rawResponse: '', fallbackStage: fb });
      return fb;
    }
  };

  const retryJsonParse = async (settings, stageName, prompts, badContent, parentStartedAt, fallbackDraft = '') => {
    const correctiveSystem = prompts.system + '\n\nCORRECTION: Your previous response did not contain a usable complete RP draft. Return ONLY the complete RP response draft as plain text now. No JSON, no markdown fences, no analysis, no commentary.';
    const correctiveUser = prompts.user + '\n\nReturn only the complete RP response draft now. Start with the required response header/template if present, then include the actual body text.';
    const retryResult = await callLLMWithPreset(settings, stageName, correctiveSystem, correctiveUser);
    if (!retryResult.ok) return null;
    const retryParsed = relaxedJsonParse(retryResult.content);
    const retryNormalized = normalizePlainTextFullDraft(stageName, retryResult.content, fallbackDraft) || normalizeStageData(retryParsed, stageName, fallbackDraft);
    if (hasCompleteStageDraft(retryNormalized)) {
      recordStageTrace({ stage: stageName, ok: true, reason: 'retry_success', provider: retryResult.provider || '', presetName: retryResult.presetName || '', model: retryResult.model || '', elapsedMs: Date.now() - parentStartedAt, systemPrompt: correctiveSystem, userPrompt: correctiveUser, rawResponse: retryResult.content || '', parsed: retryNormalized });
      return { result: retryResult, parsed: retryParsed, normalized: retryNormalized };
    }
    return null;
  };

  const runTwoCallStage = async (stageName, recent, previous, settings, ledger) => {
    const analysisPrompts = aideAnalysisPrompt(stageName, recent, previous, settings, ledger);
    const fallbackDraft = stageDraft(previous);
    const startedAt = Date.now();
    try {
      const analysisResult = await callLLMWithPreset(settings, stageName, analysisPrompts.system, analysisPrompts.user);
      let analysis = null;
      if (analysisResult.ok) {
        analysis = normalizeAnalysisResult(stageName, analysisResult.content);
        if (!analysis) {
          const plainAnalysis = relaxedJsonParse(analysisResult.content);
          if (plainAnalysis) analysis = normalizeAnalysisResult(stageName, JSON.stringify(plainAnalysis));
        }
      }
      if (!analysis) {
        log(`${stageName} analysis call failed, falling back to single-call`);
        return runStage(stageName, recent, previous, settings, ledger);
      }
      const rewritePrompts = aideRewritePrompt(stageName, recent, previous, settings, analysis, ledger);
      const rewriteResult = await callLLMWithPreset(settings, stageName, rewritePrompts.system, rewritePrompts.user);
      if (!rewriteResult.ok) {
        log(`${stageName} rewrite call failed, falling back to single-call`);
        return runStage(stageName, recent, previous, settings, ledger);
      }
      let parsed = relaxedJsonParse(rewriteResult.content);
      let normalized = normalizeStageData(parsed, stageName, fallbackDraft);
      if (!hasCompleteStageDraft(normalized)) {
        normalized = normalizePlainTextFullDraft(stageName, rewriteResult.content, fallbackDraft);
      }
      if (!hasCompleteStageDraft(normalized)) {
        const retried = await retryJsonParse(settings, stageName, rewritePrompts, rewriteResult.content, startedAt, fallbackDraft);
        if (retried) {
          rewriteResult.content = retried.result.content;
          parsed = retried.parsed;
          normalized = retried.normalized;
        }
      }
      if (!hasCompleteStageDraft(normalized)) {
        log(`${stageName} rewrite parse failed, falling back to single-call`);
        return runStage(stageName, recent, previous, settings, ledger);
      }
      if (analysis.analysis?.summary) {
        normalized.analysis = normalized.analysis || {};
        normalized.analysis.summary = analysis.analysis.summary;
        normalized.analysis.constraints = [...(normalized.analysis.constraints || []), ...(analysis.analysis.constraints || [])];
        normalized.analysis.risks = [...(normalized.analysis.risks || []), ...(analysis.analysis.risks || [])];
      }
      if (analysis.doNotReveal?.length) {
        normalized.draft = normalized.draft || {};
        normalized.draft.do_not_reveal = [...(normalized.draft.do_not_reveal || []), ...analysis.doNotReveal];
      }
      if (analysis.povLimits?.length) {
        normalized.draft = normalized.draft || {};
        normalized.draft.pov_limits = [...(normalized.draft.pov_limits || []), ...analysis.povLimits];
      }
      normalized.provider = rewriteResult.provider;
      normalized.presetName = rewriteResult.presetName;
      normalized.model = rewriteResult.model;
      normalized.elapsedMs = Date.now() - startedAt;
      normalized.twoCallAnalysis = analysis;
      recordStageTrace({ stage: stageName, ok: true, reason: '', provider: rewriteResult.provider || '', presetName: rewriteResult.presetName || '', model: rewriteResult.model || '', elapsedMs: normalized.elapsedMs, systemPrompt: rewritePrompts.system, userPrompt: rewritePrompts.user, rawResponse: rewriteResult.content || '', parsed: normalized });
      return normalized;
    } catch (error) {
      warn(`${stageName}_twocall_failed`, error);
      if (settings.failureMode === 'hard') throw error;
      log(`${stageName} two-call exception, falling back to single-call`);
      return runStage(stageName, recent, previous, settings, ledger);
    }
  };

  const runAideStage = async (stageName, recent, previous, settings, ledger) => {
    if (settings.twoCallAide !== false) {
      const result = await runTwoCallStage(stageName, recent, previous, settings, ledger);
      if (result?.draft?.rp_text && result.twoCallAnalysis) {
        const key = stageName.replace('aide_', '');
        ledger[key] = {
          analysis: result.twoCallAnalysis.analysis,
          doNotReveal: result.twoCallAnalysis.doNotReveal,
          povLimits: result.twoCallAnalysis.povLimits,
          beats: result.twoCallAnalysis.beats,
          constraints: result.twoCallAnalysis.analysis?.constraints || []
        };
        Runtime.analysisLedger = { ...ledger };
      }
      return result;
    }
    const result = await runStage(stageName, recent, previous, settings, ledger);
    if (result?.draft?.rp_text) {
      const key = stageName.replace('aide_', '');
      ledger[key] = extractAnalysisFromStage(result) || {};
      Runtime.analysisLedger = { ...ledger };
    }
    return result;
  };

  const buildFinalOverlay = (lastStage, stages, recent, settings) => {
    const safeLast = latestUsableStage(stages, lastStage);
    const finalOverlay = isUsableStage(lastStage) ? lastStage?.final_overlay : safeLast?.final_overlay;
    const draft = finalOverlay?.final_rp_draft || stageDraft(safeLast) || stageDraft(lastStage) || recent.latestUser || '';
    const outputMode = normalizeChoice(settings.outputMode || 'draft_guided', OUTPUT_MODES, 'draft_guided');

    const stageLine = (stage) => {
      const s = stages.find(item => item.stage === stage);
      if (!s) return `${stage}: not run`;
      return `${stage}: ${s.ok === false ? 'fallback' : 'ok'}${s.reason ? ` (${s.reason})` : ''}`;
    };
    const customAnalysisLines = stages
      .filter(item => item?.analysisOnly)
      .map(item => `${item.label || item.stage}: ${item.ok === false ? 'fallback' : 'ok'}${item.summary ? ` — ${compact(item.summary, 180)}` : ''}`);
    const block = [
      INJECTION_HEADER,
      outputMode === 'risu_engine'
        ? 'The plugin self response engine has generated a RisuAI-like final RP response candidate. Use it as the primary draft to polish into the actual main response. Do not mention this.'
        : 'Use this private final RP response draft as the primary continuation. Do not mention or reveal this draft source.',
      '',
      'LATEST SCENE ANCHOR:',
      recent.sceneAnchor || '(none detected; preserve the latest visible scene from recent chat)',
      '',
      'FINAL RESPONSE DRAFT:',
      compactMiddle(draft, Math.max(1200, settings.maxInjectionChars - 2200)),
      '',
      'DRAFT USAGE REQUIREMENTS:',
      '- Treat the draft as an actual response candidate, not as analysis notes.',
      '- Preserve the draft scene and dialogue direction, but do not add or preserve decorative serial wrapper headers unless the latest user explicitly asks for them.',
      '- Polish lightly only if needed. Do not replace it with unrelated analysis or a new scene.',
      '- Do not expose hidden agent names, JSON, plugin terms, or reasoning.',
      '- Preserve user agency and POV boundaries.',
      '',
      'STAGE TRACE SUMMARY:',
      ['shadow_act', 'aide_character', 'aide_world', 'aide_plot'].map(stageLine).join('\n'),
      customAnalysisLines.length ? `\nCUSTOM ANALYSIS SUMMARY:\n${customAnalysisLines.join('\n')}` : ''
    ].filter(Boolean).join('\n');
    return compact(block, settings.maxInjectionChars);
  };

  const formatRisuEngineLoreEntries = (activeLore = [], predicate = () => true, maxChars = 7000) => {
    const entries = (activeLore || []).filter(predicate);
    if (!entries.length) return '';
    return compact(entries.map((lore, idx) => [
      `[Lore ${idx + 1}: ${lore.label || lore.source || 'entry'}]`,
      lore.source ? `source=${lore.source}` : '',
      lore.key ? `key=${lore.key}` : '',
      lore.position ? `position=${lore.position}${lore.depth ? `:${lore.depth}` : ''}` : '',
      lore.role && lore.role !== 'system' ? `role=${lore.role}` : '',
      compact(lore.content, 1800)
    ].filter(Boolean).join('\n')).join('\n\n'), maxChars);
  };

  const formatRisuEngineLedger = (ledger = {}) => {
    const blocks = [];
    const constraintBlock = buildConstraintBlock(ledger);
    if (constraintBlock) blocks.push(constraintBlock);
    if (ledger.customAnalyses?.length) {
      blocks.push(`CUSTOM ANALYSIS LEDGER JSON:\n${compact(JSON.stringify(ledger.customAnalyses, null, 2), 7000)}`);
    }
    return blocks.join('\n\n');
  };

  const buildRisuEnginePromptPlan = (recent, finalDraft, stages, settings, ledger) => {
    const activeLore = recent?.risuActiveLore || [];
    const descLore = formatRisuEngineLoreEntries(activeLore, lore => ['before_desc', 'after_desc', 'personality', 'scenario'].includes(lore.position), 5000);
    const normalLore = formatRisuEngineLoreEntries(activeLore, lore => !lore.position || lore.position === '', 9000);
    const postLore = formatRisuEngineLoreEntries(activeLore, lore => lore.position === 'depth' && Number(lore.depth || 0) === 0, 5000);
    const otherPositionLore = formatRisuEngineLoreEntries(activeLore, lore => lore.position && !['before_desc', 'after_desc', 'personality', 'scenario', 'depth'].includes(lore.position), 5000);
    const ledgerText = formatRisuEngineLedger(ledger);
    const stageSummary = (stages || []).map(stage => `${stage.label || STAGE_DEF_MAP[stage.stage]?.label || stage.stage}: ${stage.ok === false ? 'fallback' : 'ok'}${stage.reason ? ` (${stage.reason})` : ''}`).join('\n');
    const olderChat = (recent?.visibleMessages || []).slice(0, -2).map((m, idx) => `#${idx + 1} <${m.role}${m.name ? `:${m.name}` : ''}>\n${m.content}`).join('\n\n---\n\n');
    const latestChat = (recent?.visibleMessages || []).slice(-2).map((m, idx) => `#${idx + 1} <${m.role}${m.name ? `:${m.name}` : ''}>\n${m.content}`).join('\n\n---\n\n') || recent?.visibleText || recent?.text || '';
    return [
      {
        type: 'plain',
        type2: 'main',
        role: 'system',
        name: 'RisuAI-like main prompt',
        content: [
          'You are the SGA-RP self response engine.',
          'Mimic RisuAI response assembly: prompt items are ordered, then chat history is replayed, then postEverything/prefill instructions constrain the final assistant response.',
          'Return only the final assistant RP response. No JSON, no markdown fence, no analysis, no plugin/RisuAI/agent terminology.'
        ].join('\n')
      },
      {
        type: 'description',
        role: 'system',
        innerFormat: '[Roleplay Setting]\n{{slot}}',
        content: compact([recent?.risuContext || '', descLore].filter(Boolean).join('\n\n'), settings.shadowRisuContextMaxChars || DEFAULT_SHADOW_RISU_CONTEXT_CHARS)
      },
      {
        type: 'persona',
        role: 'system',
        innerFormat: '[User Persona / Character Profile]\n{{slot}}',
        content: compact(recent?.risuContextMeta?.persona ? recent.risuContext : '', 5000)
      },
      {
        type: 'plain',
        type2: 'normal',
        role: 'system',
        name: 'Supplementary Information',
        content: '[Supplementary Information]'
      },
      {
        type: 'lorebook',
        role: 'system',
        content: normalLore || '(No normal-position lorebook entry was activated.)'
      },
      {
        type: 'plain',
        type2: 'globalNote',
        role: 'system',
        name: 'Global Note / Built-in Style',
        content: builtInStylePresetPrompt(settings)
      },
      {
        type: 'authornote',
        role: 'system',
        innerFormat: '[Author Note]\n{{slot}}',
        content: recent?.sceneAnchor ? `Latest scene anchor: ${recent.sceneAnchor}` : ''
      },
      {
        type: 'memory',
        role: 'system',
        innerFormat: '[Roleplay Summary / Retrieved Memory]\n{{slot}}',
        content: compact([recent?.risuMemory || '', recent?.othersInfo || '', ledgerText].filter(Boolean).join('\n\n'), 12000)
      },
      {
        type: 'plain',
        type2: 'normal',
        role: 'system',
        name: 'Response Instruction',
        content: [
          'RESPONSE INSTRUCTION:',
          '- Use the serial draft as the primary response candidate and improve it in-place.',
          '- Preserve the same-turn boundary. Do not write the next scene after the draft.',
          '- Keep functional status/interface blocks and image-command rules when present, but do not add # 응답, volume/chapter, Chatindex, or automatic timestamp wrappers like ⏱️[YYYY-MM-DD...] unless the latest user explicitly asks for them.',
          '- Preserve prose datelines that carry scene time/place, such as "밤 10:20 PM, 시끌벅적한 고기집의 한구석."; those are story text, not removable headers.',
          '- Preserve user agency: do not decide the user character\'s hidden thoughts, feelings, choices, or dialogue.',
          '- Use active lore privately. Do not recite profiles or expose hidden facts as narration.',
          postLore ? `\n[Depth 0 / PostEverything Lore]\n${postLore}` : '',
          otherPositionLore ? `\n[Positioned Lore]\n${otherPositionLore}` : ''
        ].filter(Boolean).join('\n')
      },
      {
        type: 'chat',
        rangeStart: 0,
        rangeEnd: -2,
        chatAsOriginalOnSystem: true,
        content: olderChat || '(No older visible chat in current window.)'
      },
      {
        type: 'chat',
        rangeStart: -2,
        rangeEnd: 'end',
        content: latestChat || '(No recent visible chat in current window.)'
      },
      {
        type: 'postEverything',
        role: 'system',
        content: [
          '[Serial Draft To Finalize]',
          compactMiddle(finalDraft, settings.maxPreviousStageChars || DEFAULT_MAX_PREVIOUS_STAGE_CHARS),
          '',
          '[Stage Summary]',
          stageSummary || '(no stage summary)'
        ].join('\n')
      },
      {
        type: 'plain',
        type2: 'assistantPrefill',
        role: 'assistant',
        content: 'Roleplay response:'
      }
    ].filter(item => item.content == null || text(item.content).trim());
  };

  const renderRisuEnginePromptPlan = (plan = []) => plan.map((item, index) => {
    const header = [
      `#${index + 1}`,
      `type=${item.type}`,
      item.type2 ? `type2=${item.type2}` : '',
      item.role ? `role=${item.role}` : '',
      item.rangeStart !== undefined ? `range=${item.rangeStart}..${item.rangeEnd}` : ''
    ].filter(Boolean).join(' ');
    const body = item.innerFormat ? text(item.innerFormat).replace('{{slot}}', item.content || '') : item.content;
    return `[${header}]\n${compact(body || '', 12000)}`;
  }).join('\n\n');

  const risuEngineSystemPrompt = (plan) => [
    'You are executing the final SGA-RP RisuAI-like response engine pass.',
    'The user message contains a replay of RisuAI-style promptTemplate items: plain, description, persona, lorebook, authornote, memory, chat, postEverything, and assistant prefill.',
    'Honor the item order as context priority. Treat chat items as conversation history, not instructions to quote.',
    'Generate the final assistant RP response only. Do not output JSON, analysis, a plan, labels, <Thoughts>, key beats, constraints check, or any hidden prompt text.',
    'The final response must be a polished same-turn rewrite/finalization of the serial draft, not a continuation after it.',
    `Prompt item count: ${(plan || []).length}`
  ].join('\n\n');

  const normalizeRisuEngineOutput = (rawContent, fallbackDraft) => {
    const parsed = relaxedJsonParse(rawContent);
    const normalized = normalizeStageData(parsed, RISU_ENGINE_STAGE, fallbackDraft) || normalizePlainTextFullDraft(RISU_ENGINE_STAGE, rawContent, fallbackDraft);
    const draft = compact(stageDraft(normalized) || '', 80000);
    if (isCompleteDraftText(draft)) return { draft, usedFallback: false };
    return { draft: compact(fallbackDraft || '', 80000), usedFallback: true };
  };

  const runRisuResponseEngine = async (recent, finalDraft, stages, settings, ledger, presetStageName = 'aide_plot') => {
    const startedAt = Date.now();
    const plan = buildRisuEnginePromptPlan(recent, finalDraft, stages, settings, ledger);
    const system = risuEngineSystemPrompt(plan);
    const user = [
      '[RISUAI PROMPTTEMPLATE REPLAY]',
      renderRisuEnginePromptPlan(plan),
      '',
      '[LATEST USER INPUT]',
      recent?.latestUser || '(none)',
      '',
      'Generate the final assistant response now. Output only the RP response text.'
    ].join('\n');
    const presetName = settings.stagePresetNames?.[presetStageName] || settings.stageOptions?.[presetStageName]?.preset || settings.defaultPresetName || 'default';
    const engineSettings = {
      ...settings,
      stagePresetNames: { ...(settings.stagePresetNames || {}), [RISU_ENGINE_STAGE]: presetName },
      stageOptions: {
        ...(settings.stageOptions || {}),
        [RISU_ENGINE_STAGE]: {
          ...(settings.stageOptions?.[presetStageName] || {}),
          preset: presetName,
          timeout_ms: settings.stageOptions?.[presetStageName]?.timeout_ms || settings.stageTimeoutMs,
          max_chars: Math.max(settings.maxRecentChars || DEFAULT_MAX_RECENT_CHARS, settings.maxPreviousStageChars || DEFAULT_MAX_PREVIOUS_STAGE_CHARS),
          turn_window: settings.turnWindow || DEFAULT_RECENT_TURNS,
          execution_mode: 'draft_only',
          risu_refs: defaultRisuReferencesForStage('shadow_act')
        }
      }
    };
    Runtime.risuEngine = {
      at: Date.now(),
      status: 'running',
      presetStageName,
      promptPlan: plan.map(item => ({
        type: item.type,
        type2: item.type2 || '',
        role: item.role || '',
        rangeStart: item.rangeStart,
        rangeEnd: item.rangeEnd,
        chars: text(item.content || '').length,
        preview: compact(item.content || '', 400)
      }))
    };
    try {
      const maxTokens = Math.max(768, Math.min(
        DEFAULT_MAX_STAGE_TOKENS * 4,
        Math.ceil((settings.targetDraftMaxChars || DEFAULT_TARGET_DRAFT_MAX_CHARS) / 2.1) + 1280
      ));
      const result = await callLLMWithPreset(engineSettings, RISU_ENGINE_STAGE, system, user, { maxTokens, temp: undefined });
      if (!result.ok) {
        const fb = {
          schema: FULL_DRAFT_STAGE_SCHEMA,
          stage: RISU_ENGINE_STAGE,
          ok: false,
          fallback: true,
          reason: result.reason || 'engine_llm_failed',
          analysis: { summary: 'RisuAI-like self response engine failed; keeping serial draft.', constraints: [], risks: [] },
          draft: { rp_text: finalDraft },
          elapsedMs: Date.now() - startedAt
        };
        Runtime.risuEngine = { ...Runtime.risuEngine, status: 'fallback', reason: fb.reason, elapsedMs: fb.elapsedMs };
        recordStageTrace({ stage: RISU_ENGINE_STAGE, ok: false, reason: fb.reason, provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: fb.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: result.content || result.raw || '', parsed: fb });
        return fb;
      }
      const engineOutput = normalizeRisuEngineOutput(result.content, finalDraft);
      const draft = engineOutput.draft;
      const normalized = {
        schema: FULL_DRAFT_STAGE_SCHEMA,
        stage: RISU_ENGINE_STAGE,
        ok: !!draft && !engineOutput.usedFallback,
        fallback: !!engineOutput.usedFallback,
        reason: engineOutput.usedFallback ? 'engine_output_not_usable_fallback_to_serial_draft' : '',
        analysis: { summary: engineOutput.usedFallback ? 'RisuAI-like engine output was not usable; keeping serial draft.' : 'Final response generated by RisuAI-like promptTemplate replay engine.', constraints: [], risks: [] },
        draft: { rp_text: draft },
        draft_kind: 'risuai_like_final_response',
        provider: result.provider,
        presetName: result.presetName,
        model: result.model,
        elapsedMs: result.elapsedMs || (Date.now() - startedAt)
      };
      Runtime.risuEngine = {
        ...Runtime.risuEngine,
        status: normalized.fallback ? 'fallback' : normalized.ok ? 'ok' : 'empty',
        reason: normalized.reason || '',
        elapsedMs: normalized.elapsedMs,
        provider: result.provider,
        presetName: result.presetName,
        model: result.model,
        responseChars: draft.length,
        responsePreview: compact(draft, 1200)
      };
      recordStageTrace({ stage: RISU_ENGINE_STAGE, ok: normalized.ok, reason: '', provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: normalized.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: result.content || '', parsed: normalized });
      return normalized;
    } catch (error) {
      warn('risu_response_engine_failed', error);
      if (settings.failureMode === 'hard') throw error;
      const fb = {
        schema: FULL_DRAFT_STAGE_SCHEMA,
        stage: RISU_ENGINE_STAGE,
        ok: false,
        fallback: true,
        reason: compact(error?.message || error, 500),
        analysis: { summary: 'RisuAI-like self response engine failed; keeping serial draft.', constraints: [], risks: [] },
        draft: { rp_text: finalDraft },
        elapsedMs: Date.now() - startedAt
      };
      Runtime.risuEngine = { ...Runtime.risuEngine, status: 'fallback', reason: fb.reason, elapsedMs: fb.elapsedMs };
      recordStageTrace({ stage: RISU_ENGINE_STAGE, ok: false, reason: fb.reason, elapsedMs: fb.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: '', parsed: fb });
      return fb;
    }
  };

  const injectSystemMessage = (messages, content, settings) => {
    Runtime.lastInjection = compact(content, settings?.maxInjectionChars || DEFAULT_MAX_INJECTION_CHARS);
    const systemMessage = { role: 'system', content };
    const copy = messages.slice();
    if (settings.injectionPosition === 'before_last_user') {
      const resolvedIndex = Number(settings?.currentTurnResolution?.requestIndex);
      if (Number.isInteger(resolvedIndex) && resolvedIndex >= 0 && resolvedIndex <= copy.length) {
        copy.splice(resolvedIndex, 0, systemMessage);
        return copy;
      }
      for (let i = copy.length - 1; i >= 0; i -= 1) {
        if (currentTurnRole(copy[i]) === 'user') {
          copy.splice(i, 0, systemMessage);
          return copy;
        }
      }
      copy.push(systemMessage);
      return copy;
    }
    if (settings.injectionPosition === 'last_system') {
      let lastSystem = -1;
      for (let i = 0; i < copy.length; i += 1) {
        if (text(copy[i]?.role).toLowerCase() === 'system') lastSystem = i;
      }
      if (lastSystem >= 0) copy.splice(lastSystem + 1, 0, systemMessage);
      else copy.unshift(systemMessage);
      return copy;
    }
    copy.unshift(systemMessage);
    return copy;
  };

  const recordBeforeSkip = (reason, details = {}) => {
    const cleanReason = compact(reason || 'skipped', 500);
    const preserveDebug = !!details.preserveDebug;
    Runtime.lastInjection = '';
    Runtime.lastSafeStage = null;
    Runtime.finalDraft = '';
    Runtime.risuEngine = null;
    if (!preserveDebug) {
      Runtime.lastProviderRequest = null;
      Runtime.lastProviderResponse = null;
      Runtime.lastProviderError = null;
      Runtime.lastBackendBridge = null;
    }
    Runtime.finalDraftMeta = { at: Date.now(), skipped: true, reason: cleanReason, ...details };
    if (!preserveDebug || !Runtime.stageTrace.length) {
      Runtime.stageTrace = [{
        at: Date.now(),
        stage: 'beforeRequest',
        ok: false,
        skipped: true,
        reason: cleanReason,
        systemPrompt: '',
        userPrompt: '',
        rawResponse: '',
        parsed: null,
        fallbackStage: null
      }];
    }
    if (cleanReason === 'provider_or_preset_unconfigured' || cleanReason.startsWith('preset_unconfigured')) {
      const issueText = Array.isArray(details.issues) && details.issues.length ? ` Missing: ${details.issues.join(', ')}.` : '';
      Runtime.warnings.push({ at: Date.now(), msg: `[beforeRequest skipped] ${cleanReason}: configure a provider preset/model for SHADOW ACT.${issueText}` });
      if (Runtime.warnings.length > 60) Runtime.warnings.shift();
    }
  };

  const runPipeline = async (messages, type, settings) => {
    const baseRecent = buildRecentChat(messages, settings);
    Runtime.lastBeforeContext = {
      at: Date.now(),
      type: text(type || ''),
      recent: baseRecent,
      messages: Array.isArray(messages) ? messages.slice() : []
    };
    Runtime.stageTrace = [];
    Runtime.lastSafeStage = null;
    Runtime.analysisLedger = {};
    Runtime.lastRisuContext = { stages: {}, last: null };
    Runtime.risuEngine = null;
    const stages = [];
    const stageRecents = {};
    let current = null;
    let risuSnapshot = null;
    const ledger = { customAnalyses: [] };

    const prepareStage = async (stageName) => {
      const scopedSettings = scopedSettingsForStage(settings, stageName);
      const recent = buildRecentChat(messages, scopedSettings);
      const refs = stageExecutionOptions(settings, stageName).risuRefs;
      if (stageHasRisuReferences(settings, stageName)) {
        const risuContext = await buildShadowRisuContext(messages, recent, scopedSettings, risuSnapshot, refs);
        risuSnapshot = risuContext.snapshot || risuSnapshot;
        recent.risuContext = risuContext.block;
        recent.risuContextMeta = risuContext.meta;
        recent.risuActiveLore = risuContext.activeLore || [];
        recent.risuSelectedLoreCandidates = risuContext.selectedCandidates || [];
        recent.risuMemory = risuContext.memory || '';
        Runtime.lastRisuContext.stages[stageName] = { block: risuContext.block, meta: risuContext.meta };
        Runtime.lastRisuContext.last = Runtime.lastRisuContext.stages[stageName];
      } else {
        recent.risuContext = '';
        recent.risuContextMeta = { enabled: false, references: refs };
        recent.risuActiveLore = [];
        recent.risuSelectedLoreCandidates = [];
        recent.risuMemory = '';
        Runtime.lastRisuContext.stages[stageName] = { block: '', meta: recent.risuContextMeta };
      }
      stageRecents[stageName] = recent;
      return { recent, settings: scopedSettings };
    };

    const runCustomAnalysesAfter = async (anchorStageName) => {
      const agents = (settings.customAnalysisAgents || [])
        .filter(agent => agent?.enabled && agent.insert_after === anchorStageName);
      for (const agent of agents) {
        const env = await prepareStage(agent.id);
        const result = await runCustomAnalysisAgent(agent, env.recent, current, env.settings, ledger);
        if (result) stages.push(result);
        if (result?.ok !== false && !result?.fallback) {
          const entry = analysisLedgerEntry(result);
          if (entry) ledger.customAnalyses.push(entry);
          Runtime.analysisLedger = { ...ledger, customAnalyses: [...ledger.customAnalyses] };
        }
      }
    };

    const prepareRisuEngineRecent = async (seedRecent, presetSourceStage) => {
      const refs = defaultRisuReferencesForStage('shadow_act');
      const scopedSettings = {
        ...settings,
        activeStageName: RISU_ENGINE_STAGE,
        activeStageOptions: {
          maxChars: Math.max(settings.maxRecentChars || DEFAULT_MAX_RECENT_CHARS, settings.maxPreviousStageChars || DEFAULT_MAX_PREVIOUS_STAGE_CHARS),
          turnWindow: settings.turnWindow || DEFAULT_RECENT_TURNS,
          timeoutMs: settings.stageTimeoutMs || DEFAULT_STAGE_TIMEOUT_MS,
          executionMode: 'draft_only',
          risuRefs: refs
        }
      };
      const builtRecent = buildRecentChat(messages, scopedSettings);
      const recent = {
        ...builtRecent,
        sceneAnchor: seedRecent?.sceneAnchor || builtRecent.sceneAnchor
      };
      const risuContext = await buildShadowRisuContext(messages, recent, scopedSettings, risuSnapshot, refs);
      risuSnapshot = risuContext.snapshot || risuSnapshot;
      recent.risuContext = risuContext.block || seedRecent?.risuContext || '';
      recent.risuContextMeta = risuContext.meta || seedRecent?.risuContextMeta || {};
      recent.risuActiveLore = risuContext.activeLore || seedRecent?.risuActiveLore || [];
      recent.risuSelectedLoreCandidates = risuContext.selectedCandidates || seedRecent?.risuSelectedLoreCandidates || [];
      recent.risuMemory = risuContext.memory || seedRecent?.risuMemory || '';
      stageRecents[RISU_ENGINE_STAGE] = recent;
      Runtime.lastRisuContext.stages[RISU_ENGINE_STAGE] = { block: recent.risuContext, meta: recent.risuContextMeta, presetSourceStage };
      Runtime.lastRisuContext.last = Runtime.lastRisuContext.stages[RISU_ENGINE_STAGE];
      return { recent, settings: scopedSettings };
    };

    if (!settings.enableShadowAct) return { ok: false, reason: 'shadow_act_disabled' };

    const shadowEnv = await prepareStage('shadow_act');
    current = shadowEnv.settings.twoCallAide
      ? await runTwoCallStage('shadow_act', shadowEnv.recent, null, shadowEnv.settings, ledger)
      : await runStage('shadow_act', shadowEnv.recent, null, shadowEnv.settings, ledger);
    stages.push(current);
    if (!hasCompleteStageDraft(current)) return { ok: false, reason: current?.reason || 'shadow_act_no_complete_draft', stages };
    await runCustomAnalysesAfter('shadow_act');

    if (settings.enableCharacterAide && settings.mode !== 'lite') {
      const env = await prepareStage('aide_character');
      current = await runAideStage('aide_character', env.recent, current, env.settings, ledger);
      stages.push(current);
      await runCustomAnalysesAfter('aide_character');
    }
    if (settings.enableWorldAide && settings.mode !== 'lite') {
      const env = await prepareStage('aide_world');
      current = await runAideStage('aide_world', env.recent, current, env.settings, ledger);
      stages.push(current);
      await runCustomAnalysesAfter('aide_world');
    }
    if (settings.enablePlotAide) {
      const env = await prepareStage('aide_plot');
      current = await runAideStage('aide_plot', env.recent, current, env.settings, ledger);
      stages.push(current);
    }

    let safeStage = latestUsableStage(stages, current);
    let finalRecent = stageRecents[safeStage?.stage] || stageRecents[current?.stage] || shadowEnv.recent || baseRecent;
    if (settings.outputMode === 'risu_engine') {
      const serialDraft = compact(stageDraft(safeStage) || stageDraft(current) || '', 80000);
      if (serialDraft) {
        const engineEnv = await prepareRisuEngineRecent(finalRecent, safeStage?.stage || current?.stage || 'aide_plot');
        const engineStage = await runRisuResponseEngine(engineEnv.recent, serialDraft, stages, engineEnv.settings, ledger, safeStage?.stage || current?.stage || 'aide_plot');
        if (engineStage) stages.push(engineStage);
        if (hasCompleteStageDraft(engineStage) && engineStage.ok !== false && !engineStage.fallback) {
          current = engineStage;
          safeStage = engineStage;
          finalRecent = engineEnv.recent;
        }
      }
    }
    Runtime.lastSafeStage = publicStageView(safeStage);
    Runtime.finalDraft = compact(stageDraft(safeStage) || stageDraft(current) || '', 80000);
    Runtime.finalDraftMeta = { at: Date.now(), outputMode: settings.outputMode, gradationMode: settings.gradationMode, stage: safeStage?.stage || current?.stage || '', chars: Runtime.finalDraft.length };
    const injection = buildFinalOverlay(current, stages, finalRecent, settings);
    return {
      ok: !!injection,
      injection,
      stages,
      recent: finalRecent,
      recentMeta: {
        messageCount: finalRecent.messageCount,
        filteredMessageCount: finalRecent.filteredMessageCount,
        latestUserChars: finalRecent.latestUser.length,
        latestUserPreview: compact(finalRecent.latestUser, 400),
        currentUserInputSource: finalRecent.currentTurnResolution?.source || 'none',
        currentUserInputConfidence: finalRecent.currentTurnResolution?.confidence || 'none'
      },
      type
    };
  };

  const beforeRequest = async (messages, type) => {
    const settings = await loadSettings();
    const passReason = shouldPassThrough(messages, type, settings);
    if (passReason) {
      Runtime.last = { at: Date.now(), ok: true, skipped: true, reason: passReason, type: text(type || '') };
      recordBeforeSkip(passReason, { type: text(type || '') });
      log('pass-through', passReason);
      return messages;
    }

    if (Runtime.inFlight) {
      Runtime.last = { at: Date.now(), ok: true, skipped: true, reason: 'pipeline_already_in_flight' };
      recordBeforeSkip('pipeline_already_in_flight', { type: text(type || '') });
      return messages;
    }

    const currentTurnResolution = resolveSgaCurrentTurn(messages);
    if (!currentTurnResolution.text) {
      const reason = 'current_user_input_unresolved';
      Runtime.last = {
        at: Date.now(),
        ok: true,
        skipped: true,
        reason,
        type: text(type || ''),
        currentTurnResolution: {
          source: currentTurnResolution.source,
          confidence: currentTurnResolution.confidence,
          requestIndex: currentTurnResolution.requestIndex,
          terminalPrefillIndex: currentTurnResolution.terminalPrefillIndex
        }
      };
      recordBeforeSkip(reason, { type: text(type || ''), currentTurnResolution: Runtime.last.currentTurnResolution });
      return messages;
    }
    const requestSettings = { ...settings, currentTurnResolution };

    const defaultResolved = resolvePreset(requestSettings, 'shadow_act').preset;
    const defaultIssues = providerConfigurationIssues(defaultResolved);
    if (defaultIssues.length) {
      const reason = 'provider_or_preset_unconfigured';
      Runtime.last = { at: Date.now(), ok: settings.failureMode !== 'hard', skipped: true, reason, presetName: requestSettings.stagePresetNames?.shadow_act || requestSettings.defaultPresetName || 'default', issues: defaultIssues };
      recordBeforeSkip(reason, { type: text(type || ''), presetName: requestSettings.stagePresetNames?.shadow_act || requestSettings.defaultPresetName || 'default', issues: defaultIssues });
      if (requestSettings.failureMode === 'hard') throw new Error(`[SGA-RP] Provider preset is not configured: ${defaultIssues.join(', ')}`);
      return messages;
    }

    Runtime.inFlight = true;
    scheduleGuiTraceRefresh();
    Runtime.runs += 1;
    Runtime.lastProviderRequest = null;
    Runtime.lastProviderResponse = null;
    Runtime.lastProviderError = null;
    Runtime.lastBackendBridge = null;
    const startedAt = Date.now();
    try {
      const result = await runPipeline(messages, type, requestSettings);
      Runtime.last = {
        at: Date.now(),
        ok: result.ok,
        skipped: !result.ok,
        reason: result.reason || '',
        stageCount: result.stages?.length || 0,
        elapsedMs: Date.now() - startedAt,
        recentMeta: result.recentMeta || null,
        currentTurnResolution: {
          source: currentTurnResolution.source,
          confidence: currentTurnResolution.confidence,
          requestIndex: currentTurnResolution.requestIndex,
          requestEndIndex: currentTurnResolution.requestEndIndex,
          tag: currentTurnResolution.tag || ''
        },
        stages: (result.stages || []).map(s => ({
          stage: s.stage,
          label: s.label || '',
          ok: s.ok,
          fallback: !!s.fallback,
          reason: s.reason || '',
          presetName: s.presetName || '',
          provider: s.provider || '',
          model: s.model || '',
          elapsedMs: s.elapsedMs || 0,
          draftPreview: compactMiddle(stageDraft(s), 500)
        }))
      };
      if (!result.ok || !result.injection) {
        recordBeforeSkip(result.reason || 'pipeline_failed_no_injection', { type: text(type || ''), stageCount: result.stages?.length || 0, preserveDebug: true });
        if (settings.failureMode === 'hard') throw new Error(`[SGA-RP] Pipeline failed: ${result.reason || 'unknown'}`);
        return messages;
      }
      return injectSystemMessage(messages, result.injection, requestSettings);
    } catch (error) {
      warn('beforeRequest failed', error);
      const reason = compact(error?.message || error, 500);
      Runtime.last = { at: Date.now(), ok: false, reason, elapsedMs: Date.now() - startedAt };
      Runtime.finalDraftMeta = { at: Date.now(), skipped: true, reason, type: text(type || '') };
      if (!Runtime.stageTrace.length) {
        Runtime.stageTrace = [{
          at: Date.now(),
          stage: 'beforeRequest',
          ok: false,
          skipped: false,
          reason,
          systemPrompt: '',
          userPrompt: '',
          rawResponse: '',
          parsed: null,
          fallbackStage: null
        }];
      }
      if (settings.failureMode === 'hard') throw error;
      return messages;
    } finally {
      Runtime.inFlight = false;
      scheduleGuiTraceRefresh();
    }
  };

  const renderTemplate = renderPromptTemplate;

  const postJsonContract = (stageName) => `Prefer JSON only. No markdown. Use this shape:
{
  "schema": "${POST_SCHEMA}",
  "stage": "${stageName}",
  "ok": true,
  "findings": [{"type": "quality_improvement", "severity": "low|medium|high", "evidence": "", "fix": ""}],
  "rewrite_required": true,
  "revised_response": "The complete improved assistant RP response"
}
If JSON is difficult, output only the complete revised assistant response as plain text.`;

  const builtInPostPrompt = (stageName, ledger, agent = null) => {
    const constraintBlock = buildConstraintBlock(ledger);
    const analysisIntro = constraintBlock ? `\n\n[BEFORE-REQUEST ANALYSIS LEDGER]\nUse these as private quality constraints when they are relevant. Do not expose them.\n${constraintBlock}` : '';
    const userPrompt = renderPromptTemplate(agent?.prompt || '', {
      stage: stageName,
      stage_label: agent?.label || stageName,
      json_contract: postJsonContract(stageName)
    });
    return [
      'ROLE: Custom post-response editor inside Serial Gradation Agents for RP.',
      'You receive the assistant response that RisuAI or the plugin just returned.',
      'Your job is to improve that response, not to grade it from outside.',
      'Revise and, when useful, gently expand the current response so the final answer has better characterization, continuity, prose rhythm, sensory grounding, dialogue, and same-turn payoff.',
      'Never reduce quality by summarizing, shortening into a stub, removing required templates, deleting image/status commands, flattening character voice, or replacing the scene with generic commentary.',
      'Preserve the same turn, same scene boundary, same language, user agency, POV limits, secrets, and visible response format unless the current response clearly violates the recent chat.',
      'Do not output hidden reasoning, <Thoughts>, analysis labels, plugin terminology, or a review report inside revised_response.',
      userPrompt ? `[USER EDIT DIRECTION]\n${userPrompt}` : '[USER EDIT DIRECTION]\nImprove clarity, density, naturalness, and scene-specific detail while preserving the response.',
      postJsonContract(stageName)
    ].join('\n\n') + analysisIntro;
  };

  const postStageUserBlock = (recent, originalResponse, currentResponse, stageName, settings, agent = null) => {
    const maxChars = clampInt(settings?.maxRecentChars, 1000, 100000, DEFAULT_STAGE_CONTEXT_CHARS);
    return [
      'RECENT CHAT:', compact(recent?.text || '', maxChars),
      '',
      'LATEST USER INPUT:', compact(recent?.latestUser || '', Math.min(5000, maxChars)),
      '',
      'ORIGINAL ASSISTANT RESPONSE:', compact(originalResponse, maxChars),
      '',
      'CURRENT RESPONSE TO IMPROVE:', compact(currentResponse, maxChars),
      '',
      'CUSTOM EDITOR:', compact(agent?.label || stageName, 160),
      '',
      `Improve the current response now. Return a complete revised response that can replace it.`
    ].join('\n');
  };

  const postRevisionReason = (currentResponse, revisedResponse) => {
    const current = text(currentResponse || '').trim();
    const revised = stripHiddenReasoningBlocks(revisedResponse).trim();
    if (!revised) return 'empty_revision';
    if (hiddenReasoningStartRe.test(text(revisedResponse || ''))) return 'hidden_reasoning_revision';
    if (!hasCompleteDraftEnding(revised)) return 'incomplete_revision';
    if (current.length >= 600 && revised.length < Math.max(240, Math.floor(current.length * 0.62))) return 'revision_too_short';
    if (/#\s*응답/.test(current) && !/#\s*응답/.test(revised)) return 'required_response_header_removed';
    if (/<img\s+cmd=/i.test(current) && !/<img\s+cmd=/i.test(revised)) return 'image_command_removed';
    if (/\[(?:상태|Status)|<Status/i.test(current) && !/\[(?:상태|Status)|<Status/i.test(revised)) return 'status_block_removed';
    return '';
  };

  const normalizePostResult = (stageName, rawContent, currentResponse) => {
    const parsed = relaxedJsonParse(rawContent);
    const finish = (revised, findings = [], rewriteRequired = true, ok = true, extra = {}) => {
      const cleaned = stripHiddenReasoningBlocks(revised || '').trim();
      const reason = postRevisionReason(currentResponse, cleaned);
      if (reason) {
        return {
          schema: POST_SCHEMA,
          stage: stageName,
          ok: false,
          fallback: true,
          reason,
          findings: [{ type: 'quality_guard', severity: 'medium', evidence: reason, fix: 'kept_previous_response' }],
          rewrite_required: false,
          revised_response: currentResponse,
          ...extra
        };
      }
      return {
        schema: POST_SCHEMA,
        stage: stageName,
        ok,
        findings,
        rewrite_required: rewriteRequired,
        revised_response: cleaned,
        ...extra
      };
    };
    if (parsed && typeof parsed === 'object') {
      const revised = compact(parsed.revised_response || parsed.response || parsed.text || currentResponse, 80000);
      const findings = Array.isArray(parsed.findings) ? parsed.findings.slice(0, 20).map(f => ({
          type: compact(f?.type || 'finding', 80),
          severity: compact(f?.severity || 'low', 30),
          evidence: compact(f?.evidence || '', 400),
          fix: compact(f?.fix || f?.change || '', 500)
        })) : [];
      return finish(revised || currentResponse, findings, parsed.rewrite_required !== false, parsed.ok !== false);
    }
    const plain = stripMarkdownFences(rawContent);
    if (plain && !/^\s*\{/.test(plain)) return finish(plain, [{ type: 'plain_text_revision', severity: 'low', evidence: '', fix: 'accepted_plain_text' }], true, true, { plainTextFallback: true });
    return { schema: POST_SCHEMA, stage: stageName, ok: false, fallback: true, reason: 'parse_error', findings: [{ type: 'parse_error', severity: 'medium', evidence: '', fix: 'kept_previous_response' }], rewrite_required: false, revised_response: currentResponse };
  };

  const publicPostView = (stage) => {
    if (!stage) return null;
    return {
      schema: stage.schema,
      stage: stage.stage,
      ok: stage.ok,
      fallback: !!stage.fallback,
      reason: stage.reason || '',
      label: stage.label || '',
      findings: stage.findings || [],
      rewrite_required: !!stage.rewrite_required,
      revisedPreview: compact(stage.revised_response || '', 1200),
      provider: stage.provider || '',
      presetName: stage.presetName || '',
      model: stage.model || '',
      elapsedMs: stage.elapsedMs || 0
    };
  };

  const recordPostTrace = (entry) => {
    Runtime.postTrace.push({
      at: Date.now(),
      ...entry,
      systemPrompt: compact(entry.systemPrompt || '', 6000),
      userPrompt: compact(entry.userPrompt || '', 6000),
      rawResponse: compact(entry.rawResponse || '', 12000),
      parsed: entry.parsed ? publicPostView(entry.parsed) : null
    });
    if (Runtime.postTrace.length > 16) Runtime.postTrace.splice(0, Runtime.postTrace.length - 16);
    scheduleGuiTraceRefresh();
  };

  const runPostStage = async (agentOrStageName, recent, originalResponse, currentResponse, settings) => {
    const agent = typeof agentOrStageName === 'object' ? agentOrStageName : null;
    const stageName = agent?.id || String(agentOrStageName || '');
    const maxChars = clampInt(settings?.maxRecentChars, 1000, 100000, DEFAULT_STAGE_CONTEXT_CHARS);
    const vars = {
      stage: stageName,
      stage_label: agent?.label || STAGE_DEF_MAP[stageName]?.label || stageName,
      recent_chat: compact(recent?.text || '', maxChars),
      latest_user: compact(recent?.latestUser || '', Math.min(5000, maxChars)),
      latest_assistant: compact(recent?.latestAssistant || '', Math.min(5000, maxChars)),
      original_response: compact(originalResponse, maxChars),
      current_response: compact(currentResponse, maxChars),
      response: compact(currentResponse, maxChars),
      json_contract: postJsonContract(stageName)
    };
    const renderedAgent = agent ? { ...agent, prompt: renderPromptTemplate(agent.prompt || '', vars) } : null;
    const system = builtInPostPrompt(stageName, Runtime.analysisLedger, renderedAgent);
    const user = postStageUserBlock(recent, originalResponse, currentResponse, stageName, settings, renderedAgent);
    const startedAt = Date.now();
    try {
      const result = await callLLMWithPreset(settings, stageName, system, user);
      if (!result.ok) {
        const fb = { schema: POST_SCHEMA, stage: stageName, label: agent?.label || '', ok: false, fallback: true, reason: result.reason || 'llm_failed', revised_response: currentResponse, elapsedMs: Date.now() - startedAt };
        recordPostTrace({ stage: stageName, ok: false, reason: fb.reason, provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: fb.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: result.content || result.raw || '', parsed: fb });
        return fb;
      }
      const normalized = normalizePostResult(stageName, result.content, currentResponse);
      normalized.label = agent?.label || normalized.label || '';
      normalized.provider = result.provider;
      normalized.presetName = result.presetName;
      normalized.model = result.model;
      normalized.elapsedMs = result.elapsedMs || (Date.now() - startedAt);
      recordPostTrace({ stage: stageName, ok: normalized.ok !== false, reason: normalized.reason || '', provider: result.provider || '', presetName: result.presetName || '', model: result.model || '', elapsedMs: normalized.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: result.content || '', parsed: normalized });
      return normalized;
    } catch (error) {
      warn(`${stageName}_post_failed`, error);
      if (settings.failureMode === 'hard') throw error;
      const fb = { schema: POST_SCHEMA, stage: stageName, label: agent?.label || '', ok: false, fallback: true, reason: compact(error?.message || error, 400), revised_response: currentResponse, elapsedMs: Date.now() - startedAt };
      recordPostTrace({ stage: stageName, ok: false, reason: fb.reason, elapsedMs: fb.elapsedMs, systemPrompt: system, userPrompt: user, rawResponse: '', parsed: fb });
      return fb;
    }
  };

  const stringifyContentLikeOriginal = (original, revisedText) => {
    if (typeof original === 'string') return revisedText;
    if (original && typeof original === 'object') {
      if ('content' in original) return { ...original, content: revisedText };
      if ('message' in original) return { ...original, message: revisedText };
      if ('text' in original) return { ...original, text: revisedText };
    }
    return revisedText;
  };

  const afterRequest = async (content, type) => {
    const settings = await loadSettings();
    if (settings.mode === 'off') return content;
    if (isAuxiliaryType(type)) return content;
    if (Runtime.postInFlight) return content;

    const replacementDraft = '';
    if (replacementDraft && settings.afterProcessMode === 'off') return stringifyContentLikeOriginal(content, replacementDraft);
    if (settings.afterProcessMode === 'off') return content;

    const originalText = replacementDraft || contentToText(typeof content === 'string' ? content : (content?.content || content?.message || content?.text || content));
    if (!originalText.trim()) return content;
    if (/data:image\/|<svg|base64,/i.test(originalText) && originalText.length > 2500) return content;
    if (originalText.length > settings.afterMaxResponseChars) {
      Runtime.lastPost = { at: Date.now(), ok: true, skipped: true, reason: 'response_too_long', chars: originalText.length };
      return content;
    }

    const recentFallback = Runtime.lastBeforeContext?.recent || { text: '', latestUser: '', latestAssistant: '', messageCount: 0 };
    const recentMessages = Array.isArray(Runtime.lastBeforeContext?.messages) ? Runtime.lastBeforeContext.messages : [];
    const stagesToRun = (settings.customPostAgents || []).filter(agent => agent?.enabled);
    if (!stagesToRun.length) return replacementDraft ? stringifyContentLikeOriginal(content, replacementDraft) : content;

    Runtime.postInFlight = true;
    Runtime.postTrace = [];
    scheduleGuiTraceRefresh();
    Runtime.postRuns += 1;
    const startedAt = Date.now();
    let current = originalText;
    const postStages = [];
    try {
      for (const agent of stagesToRun) {
        const stageName = agent.id;
        const stageSettings = scopedSettingsForStage(settings, stageName);
        const recent = recentMessages.length
          ? buildRecentChat(recentMessages, stageSettings)
          : {
              ...recentFallback,
              text: compact(recentFallback.text || '', stageSettings.maxRecentChars),
              visibleText: compact(recentFallback.visibleText || recentFallback.text || '', stageSettings.maxRecentChars)
            };
        const result = await runPostStage(agent, recent, originalText, current, stageSettings);
        postStages.push(result);
        if (settings.afterProcessMode === 'rewrite' && result?.ok !== false && !result?.fallback && result?.revised_response) current = result.revised_response;
      }
      Runtime.lastPost = {
        at: Date.now(),
        ok: true,
        mode: settings.afterProcessMode,
        changed: current !== originalText,
        elapsedMs: Date.now() - startedAt,
        stages: postStages.map(s => ({
          stage: s.stage,
          ok: s.ok,
          fallback: !!s.fallback,
          reason: s.reason || '',
          presetName: s.presetName || '',
          provider: s.provider || '',
          model: s.model || '',
          elapsedMs: s.elapsedMs || 0,
          findings: Array.isArray(s.findings) ? s.findings.length : 0
        }))
      };
      if (settings.afterProcessMode === 'audit') return replacementDraft ? stringifyContentLikeOriginal(content, replacementDraft) : content;
      return stringifyContentLikeOriginal(content, current);
    } catch (error) {
      warn('afterRequest failed', error);
      Runtime.lastPost = { at: Date.now(), ok: false, reason: compact(error?.message || error, 500), elapsedMs: Date.now() - startedAt };
      if (settings.failureMode === 'hard') throw error;
      return content;
    } finally {
      Runtime.postInFlight = false;
      scheduleGuiTraceRefresh();
    }
  };

  const Gui = {
    root: null,
    app: null,
    state: null,
    visible: false,
    activeTab: 'flow',
    selectedPreset: 'default',
    selectedPrompt: 'shadow_act',
    dirty: false,
    statusTimer: null,
    refreshTimer: null,
    importText: '',
    debugExportText: '',
    includeSecretsInExport: false,
    exportScope: 'flow',
    providerFilter: '',
    vertexCredentialDrafts: {},
    providerModels: {},
    providerModelLoading: false
  };

  function scheduleGuiTraceRefresh() {
    try {
      if (!Gui.visible || !Gui.app || typeof document === 'undefined') return;
      const active = document.activeElement;
      if (active && Gui.app.contains(active) && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName || '')) return;
      if (Gui.refreshTimer) clearTimeout(Gui.refreshTimer);
      Gui.refreshTimer = setTimeout(() => {
        Gui.refreshTimer = null;
        if (Gui.visible && Gui.app) renderSettingsGui();
      }, 120);
    } catch (_) {}
  }

  const cloneJson = value => JSON.parse(JSON.stringify(value ?? null));

  const runtimeStateFromSettings = settings => ({
    mode: settings.mode,
    gradationMode: settings.gradationMode,
    outputMode: settings.outputMode,
    builtInStylePreset: normalizeBuiltInStylePreset(settings.builtInStylePreset),
    turnWindow: settings.turnWindow,
    maxRecentChars: settings.maxRecentChars,
    maxPreviousStageChars: settings.maxPreviousStageChars,
    maxInjectionChars: settings.maxInjectionChars,
    injectionPosition: settings.injectionPosition,
    failureMode: settings.failureMode,
    stageTimeoutMs: settings.stageTimeoutMs,
    defaultPresetName: settings.defaultPresetName,
    afterProcessMode: settings.afterProcessMode,
    afterMaxResponseChars: settings.afterMaxResponseChars,
    enableShadowRisuContext: settings.enableShadowRisuContext,
    shadowRisuContextMaxChars: settings.shadowRisuContextMaxChars,
    twoCallAide: settings.twoCallAide,
    targetDraftMinChars: settings.targetDraftMinChars,
    targetDraftMaxChars: settings.targetDraftMaxChars,
    backendHosting: normalizeBackendHostingConfig(settings.backendHosting || {}),
    debugLog: settings.debugLog,
    guiEnabled: settings.guiEnabled
  });

  const normalizeAgentSlot = (value = {}, fallback = {}, stageId = '') => {
    const normalized = normalizeAgentSlotRecord(value, fallback, stageId);
    return {
      enabled: asBool(normalized.enabled, fallback.enabled !== false),
      presetName: compact(normalized.preset || '', 120),
      maxChars: normalized.max_chars,
      turnWindow: normalized.turn_window,
      timeoutMs: normalized.timeout_ms,
      executionMode: normalized.execution_mode,
      risuRefs: normalizeRisuReferences(normalized.risu_refs, defaultRisuReferencesForStage(stageId))
    };
  };

  const normalizePromptEntry = (value = {}, fallback = {}) => {
    const customPrompt = text(value?.customPrompt ?? value?.custom_prompt ?? fallback.customPrompt ?? '');
    return {
      mode: normalizePromptMode(value?.mode ?? fallback.mode, customPrompt),
      customPrompt,
      extraPrompt: text(value?.extraPrompt ?? value?.extra_prompt ?? fallback.extraPrompt ?? '')
    };
  };

  const promptModeForStorage = value => normalizePromptMode(value);

  const guiSlotFromSettings = (settings, stageId, enabled) => normalizeAgentSlot({
    ...(settings.stageOptions?.[stageId] || {}),
    enabled,
    presetName: settings.stagePresetNames?.[stageId] || ''
  }, {
    enabled: true,
    maxChars: DEFAULT_STAGE_CONTEXT_CHARS,
    turnWindow: settings.turnWindow,
    timeoutMs: settings.stageTimeoutMs,
    executionMode: defaultExecutionModeForStage(stageId),
    risuRefs: defaultRisuReferencesForStage(stageId)
  }, stageId);

  const guiAgentsFromSettings = settings => ({
    shadow_act: guiSlotFromSettings(settings, 'shadow_act', settings.enableShadowAct),
    aide_character: guiSlotFromSettings(settings, 'aide_character', settings.enableCharacterAide),
    aide_world: guiSlotFromSettings(settings, 'aide_world', settings.enableWorldAide),
    aide_plot: guiSlotFromSettings(settings, 'aide_plot', settings.enablePlotAide)
  });

  const normalizeGuiCustomPostAgent = (value = {}, index = 0) => {
    const record = normalizeCustomPostAgentRecord(value, index);
    return {
      id: record.id,
      enabled: record.enabled,
      label: record.label,
      presetName: record.preset,
      maxChars: record.max_chars,
      turnWindow: record.turn_window,
      timeoutMs: record.timeout_ms,
      prompt: record.prompt
    };
  };

  const guiCustomPostFromSettings = settings => normalizeCustomPostAgents(settings.customPostAgents || [])
    .map((agent, index) => normalizeGuiCustomPostAgent(agent, index));

  const guiPostsFromSettings = settings => ({
    customPostAgents: guiCustomPostFromSettings(settings)
  });

  const normalizeGuiCustomAnalysisAgent = (value = {}, index = 0) => {
    const record = normalizeCustomAnalysisAgentRecord(value, index);
    return {
      id: record.id,
      enabled: record.enabled,
      label: record.label,
      insertAfter: record.insert_after,
      presetName: record.preset,
      maxChars: record.max_chars,
      turnWindow: record.turn_window,
      timeoutMs: record.timeout_ms,
      prompt: record.prompt,
      risuRefs: normalizeRisuReferences(record.risu_refs, { persona: false, characterDescription: false, characterLorebook: false, moduleLorebook: false })
    };
  };

  const guiCustomAnalysisFromSettings = settings => normalizeCustomAnalysisAgents(settings.customAnalysisAgents || [])
    .map((agent, index) => normalizeGuiCustomAnalysisAgent(agent, index));

  const guiPromptsFromSettings = settings => {
    const prompts = {};
    for (const def of BEFORE_STAGE_DEFS) prompts[def.id] = normalizePromptEntry({
      mode: settings.beforePromptModes?.[def.id],
      customPrompt: settings.beforeCustomPrompts?.[def.id],
      extraPrompt: settings.beforeExtraPrompts?.[def.id]
    }, { mode: 'builtin' });
    for (const def of POST_STAGE_DEFS) prompts[def.id] = normalizePromptEntry({
      mode: settings.postPromptModes?.[def.id],
      customPrompt: settings.postCustomPrompts?.[def.id]
    }, { mode: 'builtin' });
    return prompts;
  };

  const guiStageSlotToStored = (slotValue, stageId) => {
    const slot = normalizeAgentSlot(slotValue, {
      enabled: true,
      presetName: '',
      maxChars: DEFAULT_STAGE_CONTEXT_CHARS,
      turnWindow: DEFAULT_RECENT_TURNS,
      timeoutMs: DEFAULT_STAGE_TIMEOUT_MS,
      executionMode: defaultExecutionModeForStage(stageId),
      risuRefs: defaultRisuReferencesForStage(stageId)
    }, stageId);
    return {
      enabled: slot.enabled,
      preset: slot.presetName,
      max_chars: slot.maxChars,
      turn_window: slot.turnWindow,
      timeout_ms: slot.timeoutMs,
      execution_mode: slot.executionMode,
      risu_refs: {
        persona: slot.risuRefs.persona,
        character_description: slot.risuRefs.characterDescription,
        character_lorebook: slot.risuRefs.characterLorebook,
        module_lorebook: slot.risuRefs.moduleLorebook
      }
    };
  };

  const guiAgentsToStored = agents => Object.fromEntries(BEFORE_STAGE_DEFS.map(def => [
    def.id,
    guiStageSlotToStored(agents?.[def.id], def.id)
  ]));

  const guiCustomAnalysisToStored = agents => normalizeCustomAnalysisAgents((agents || []).map((agent, index) => ({
    id: agent?.id || `${CUSTOM_ANALYSIS_STAGE_PREFIX}${index + 1}`,
    enabled: agent?.enabled,
    label: agent?.label,
    insert_after: agent?.insertAfter,
    preset: agent?.presetName,
    max_chars: agent?.maxChars,
    turn_window: agent?.turnWindow,
    timeout_ms: agent?.timeoutMs,
    prompt: agent?.prompt,
    risu_refs: agent?.risuRefs
  })));

  const guiAgentsWithCustomToStored = agents => ({
    ...guiAgentsToStored(agents),
    custom_analysis_agents: guiCustomAnalysisToStored(agents?.customAnalysisAgents || [])
  });

  const guiPostsToStored = (posts, mode) => ({
    mode: normalizeChoice(mode, ['off', 'audit', 'rewrite'], 'off'),
    custom_post_agents: normalizeCustomPostAgents((posts?.customPostAgents || []).map((agent, index) => ({
      id: agent?.id || `${CUSTOM_POST_STAGE_PREFIX}${index + 1}`,
      enabled: agent?.enabled,
      label: agent?.label,
      preset: agent?.presetName,
      max_chars: agent?.maxChars,
      turn_window: agent?.turnWindow,
      timeout_ms: agent?.timeoutMs,
      prompt: agent?.prompt
    })))
  });

  const guiPromptsToStored = prompts => ({
    before: Object.fromEntries(BEFORE_STAGE_DEFS.map(def => {
      const entry = normalizePromptEntry(prompts?.[def.id], { mode: 'built_in', customPrompt: '', extraPrompt: '' });
      return [def.id, { mode: promptModeForStorage(entry.mode), customPrompt: entry.customPrompt, extraPrompt: entry.extraPrompt }];
    })),
    post: Object.fromEntries(POST_STAGE_DEFS.map(def => {
      const entry = normalizePromptEntry(prompts?.[def.id], { mode: 'built_in', customPrompt: '', extraPrompt: '' });
      return [def.id, { mode: promptModeForStorage(entry.mode), customPrompt: entry.customPrompt }];
    }))
  });

  const stateFromSettings = settings => ({
    providers: cloneJson(settings.presets || {}),
    runtime: runtimeStateFromSettings(settings),
    agents: { ...guiAgentsFromSettings(settings), customAnalysisAgents: guiCustomAnalysisFromSettings(settings) },
    posts: guiPostsFromSettings(settings),
    prompts: guiPromptsFromSettings(settings)
  });


  const ensureGuiState = async (force = false) => {
    if (!Gui.state || force) {
      const settings = await loadSettings();
      Gui.state = stateFromSettings(settings);
      const names = Object.keys(Gui.state.providers || {});
      if (!names.includes(Gui.selectedPreset)) Gui.selectedPreset = names.includes('default') ? 'default' : (names[0] || 'default');
      if (!STAGE_DEF_MAP[Gui.selectedPrompt]) Gui.selectedPrompt = 'shadow_act';
      Gui.dirty = false;
    }
    return Gui.state;
  };

  const settingsForGuiPreview = () => {
    const base = Runtime.settings || {};
    const runtime = Gui.state?.runtime || {};
    const prompts = Gui.state?.prompts || {};
    return {
      ...base,
      mode: runtime.mode || 'normal',
      gradationMode: runtime.gradationMode || 'full_draft',
      outputMode: normalizeChoice(runtime.outputMode || 'draft_guided', OUTPUT_MODES, 'draft_guided'),
      builtInStylePreset: normalizeBuiltInStylePreset(runtime.builtInStylePreset),
      maxRecentChars: clampInt(runtime.maxRecentChars, 2000, 100000, DEFAULT_MAX_RECENT_CHARS),
      maxPreviousStageChars: clampInt(runtime.maxPreviousStageChars, 1000, 60000, DEFAULT_MAX_PREVIOUS_STAGE_CHARS),
      targetDraftMinChars: clampInt(runtime.targetDraftMinChars, 100, 20000, DEFAULT_TARGET_DRAFT_MIN_CHARS),
      targetDraftMaxChars: clampInt(runtime.targetDraftMaxChars, 500, 60000, DEFAULT_TARGET_DRAFT_MAX_CHARS),
      twoCallAide: runtime.twoCallAide !== false,
      beforePromptModes: Object.fromEntries(BEFORE_STAGE_DEFS.map(def => [def.id, promptModeForStorage(normalizePromptEntry(prompts[def.id], { mode: 'built_in' }).mode)])),
      beforeCustomPrompts: Object.fromEntries(BEFORE_STAGE_DEFS.map(def => [def.id, normalizePromptEntry(prompts[def.id], {}).customPrompt])),
      beforeExtraPrompts: Object.fromEntries(BEFORE_STAGE_DEFS.map(def => [def.id, normalizePromptEntry(prompts[def.id], {}).extraPrompt])),
      postPromptModes: Object.fromEntries(POST_STAGE_DEFS.map(def => [def.id, promptModeForStorage(normalizePromptEntry(prompts[def.id], { mode: 'built_in' }).mode)])),
      postCustomPrompts: Object.fromEntries(POST_STAGE_DEFS.map(def => [def.id, normalizePromptEntry(prompts[def.id], {}).customPrompt]))
    };
  };


  const builtInStageSystem = (stageId, settings = {}) => builtInStagePrompt(
    stageId,
    { text: '{{recent_chat}}', latestUser: '{{latest_user}}', latestAssistant: '{{latest_assistant}}' },
    null,
    {
      mode: settings.mode || 'normal',
      gradationMode: settings.gradationMode || 'full_draft',
      outputMode: normalizeChoice(settings.outputMode || 'draft_guided', OUTPUT_MODES, 'draft_guided'),
      builtInStylePreset: normalizeBuiltInStylePreset(settings.builtInStylePreset),
      maxRecentChars: settings.maxRecentChars || DEFAULT_MAX_RECENT_CHARS,
      maxPreviousStageChars: settings.maxPreviousStageChars || DEFAULT_MAX_PREVIOUS_STAGE_CHARS,
      beforeExtraPrompts: settings.beforeExtraPrompts || {}
    }
  ).system;

  const saveGuiState = async () => {
    const state = await ensureGuiState();
    const runtime = state.runtime || {};
    const ok = await Promise.all([
      writeStoredPresetBank(state.providers || {}),
      writeRuntimeSettings({
        mode: runtime.mode,
        gradation_mode: runtime.gradationMode || 'full_draft',
        output_mode: normalizeChoice(runtime.outputMode || 'draft_guided', OUTPUT_MODES, 'draft_guided'),
        built_in_style_preset: normalizeBuiltInStylePreset(runtime.builtInStylePreset),
        turn_window: String(runtime.turnWindow),
        max_recent_chars: String(runtime.maxRecentChars),
        max_previous_stage_chars: String(runtime.maxPreviousStageChars),
        max_injection_chars: String(runtime.maxInjectionChars),
        injection_position: runtime.injectionPosition,
        failure_mode: runtime.failureMode,
        stage_timeout_ms: String(runtime.stageTimeoutMs),
        default_preset: runtime.defaultPresetName,
        after_max_response_chars: String(runtime.afterMaxResponseChars),
        shadow_include_risu_context: String(runtime.enableShadowRisuContext !== false),
        shadow_risu_context_max_chars: String(runtime.shadowRisuContextMaxChars || DEFAULT_SHADOW_RISU_CONTEXT_CHARS),
        two_call_aide: String(runtime.twoCallAide !== false),
        target_draft_min_chars: String(runtime.targetDraftMinChars || DEFAULT_TARGET_DRAFT_MIN_CHARS),
        target_draft_max_chars: String(runtime.targetDraftMaxChars || DEFAULT_TARGET_DRAFT_MAX_CHARS),
        backend_hosting_mode: normalizeBackendHostingConfig(runtime.backendHosting || {}).mode,
        backend_hosting_url: normalizeBackendHostingConfig(runtime.backendHosting || {}).url,
        backend_hosting_token: normalizeBackendHostingConfig(runtime.backendHosting || {}).token,
        backend_hosting_auto_detected: String(normalizeBackendHostingConfig(runtime.backendHosting || {}).autoDetected === true),
        backend_hosting_last_detected_at: normalizeBackendHostingConfig(runtime.backendHosting || {}).lastDetectedAt,
        backend_hosting_last_manifest: normalizeBackendHostingConfig(runtime.backendHosting || {}).lastManifest ? JSON.stringify(normalizeBackendHostingConfig(runtime.backendHosting || {}).lastManifest) : '',
        debug_log: String(!!runtime.debugLog),
        enable_gui: String(runtime.guiEnabled !== false)
      }),
      writeAgentSlots(guiAgentsWithCustomToStored(state.agents)),
      writePostProcessors(guiPostsToStored(state.posts, runtime.afterProcessMode)),
      writePromptOverrides(guiPromptsToStored(state.prompts))
    ]);
    if (!ok.every(Boolean)) throw new Error('일부 설정을 저장하지 못했습니다. RisuAI 저장소 사용 가능 여부를 확인하세요.');
    await RisuCompat.removeItem(LEGACY_STORAGE_SETTINGS_KEY);
    Runtime.settings = null;
    await ensureGuiState(true);
    return true;
  };


  const clearStructuredSettings = async (includeSecrets = false) => {
    const keys = [
      STORAGE_PROVIDER_PRESETS_KEY,
      STORAGE_RUNTIME_SETTINGS_KEY,
      STORAGE_AGENT_SLOTS_KEY,
      STORAGE_POST_PROCESSORS_KEY,
      STORAGE_PROMPT_OVERRIDES_KEY,
      LEGACY_STORAGE_SETTINGS_KEY,
      LEGACY_STORAGE_PRESETS_KEY
    ];
    await Promise.all(keys.map(key => RisuCompat.removeItem(key)));
    if (includeSecrets) await RisuCompat.localRemoveItem(LOCAL_PROVIDER_SECRETS_KEY);
    const marker = { version: 2, migrated: false, migratedAt: new Date().toISOString(), source: 'reset' };
    await writeObject(STORAGE_MIGRATION_KEY, marker);
    migrationPromise = Promise.resolve(marker);
    Runtime.settings = null;
    Runtime.providerPresets = {};
    Runtime.migration = marker;
    Runtime.migratedFrom = marker.source;
    Runtime.lastInjection = '';
    Gui.state = null;
    Gui.dirty = false;
    return true;
  };


  const markGuiDirty = () => {
    Gui.dirty = true;
    const badge = Gui.app?.querySelector('[data-dirty-badge]');
    if (badge) {
      badge.textContent = '저장되지 않은 변경';
      badge.dataset.dirty = 'true';
    }
  };

  const injectGuiStyle = () => {
    if (typeof document === 'undefined' || document.getElementById('sga-rp-gui-style')) return;
    const style = document.createElement('style');
    style.id = 'sga-rp-gui-style';
    style.textContent = `
:root{color-scheme:dark;--sga-bg:#090d14;--sga-surface:#111827;--sga-surface2:#172033;--sga-surface3:#202b40;--sga-line:#2b3850;--sga-text:#eef2ff;--sga-muted:#9aa8bf;--sga-accent:#7c9cff;--sga-good:#4ade80;--sga-warn:#fbbf24;--sga-danger:#fb7185}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--sga-bg);color:var(--sga-text);font-family:Inter,Pretendard,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select,textarea{font:inherit}
#sga-rp-gui-root{min-height:100vh;background:radial-gradient(circle at 15% 0%,rgba(124,156,255,.13),transparent 30%),var(--sga-bg)}
.sga-app{min-height:100vh}.sga-top{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 24px;border-bottom:1px solid var(--sga-line);background:rgba(9,13,20,.94);backdrop-filter:blur(18px)}
.sga-brand h1{font-size:20px;line-height:1.2;margin:0}.sga-brand p{margin:5px 0 0;color:var(--sga-muted);font-size:12px}.sga-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.sga-dirty{font-size:11px;color:var(--sga-muted);padding:6px 9px;border:1px solid var(--sga-line);border-radius:999px}.sga-dirty[data-dirty="true"]{color:#fde68a;border-color:#8a6b1e;background:rgba(251,191,36,.08)}
.sga-tabs{position:sticky;top:77px;z-index:15;display:flex;gap:7px;overflow:auto;padding:10px 24px;border-bottom:1px solid var(--sga-line);background:rgba(9,13,20,.92);scrollbar-width:thin}.sga-tab{white-space:nowrap;border:1px solid var(--sga-line);border-radius:999px;background:var(--sga-surface);color:#cbd5e1;padding:8px 12px;font-size:12px;font-weight:800;cursor:pointer}.sga-tab:hover{background:var(--sga-surface2)}.sga-tab[data-active="true"]{background:var(--sga-text);border-color:var(--sga-text);color:#09101d}.sga-tab .sga-tab-short{display:none}
.sga-main{max-width:1320px;margin:0 auto;padding:22px 24px 80px}.sga-status{min-height:24px;margin-bottom:10px;padding:0 2px;color:#bbf7d0;font-size:12px}.sga-status.err{color:#fecdd3}
.sga-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.sga-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.sga-card{border:1px solid var(--sga-line);border-radius:16px;background:linear-gradient(180deg,rgba(23,32,51,.92),rgba(17,24,39,.92));padding:16px;box-shadow:0 18px 45px rgba(0,0,0,.13)}.sga-card.wide{grid-column:1/-1}.sga-card h2,.sga-card h3{margin:0 0 8px}.sga-card h2{font-size:17px}.sga-card h3{font-size:14px}.sga-note{color:var(--sga-muted);font-size:12px;line-height:1.55}.sga-section-title{margin-bottom:14px}.sga-section-title h2{margin:0;font-size:18px}.sga-section-title p{margin:6px 0 0;color:var(--sga-muted);font-size:12px}
.sga-stat{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.sga-stat-value{font-size:28px;font-weight:900}.sga-stat-label{color:var(--sga-muted);font-size:12px}.sga-badge{display:inline-flex;align-items:center;border:1px solid var(--sga-line);border-radius:999px;padding:4px 8px;font-size:11px;font-weight:800}.sga-badge.good{color:#bbf7d0;border-color:#166534;background:rgba(34,197,94,.08)}.sga-badge.warn{color:#fde68a;border-color:#854d0e;background:rgba(251,191,36,.08)}.sga-badge.off{color:#cbd5e1}.sga-flow{display:flex;align-items:stretch;gap:8px;overflow:auto;padding:8px 0}.sga-flow-node{min-width:150px;flex:1;border:1px solid var(--sga-line);border-radius:13px;padding:12px;background:#0d1421}.sga-flow-node strong{display:block;font-size:12px}.sga-flow-node span{display:block;color:var(--sga-muted);font-size:11px;margin-top:5px;line-height:1.4}.sga-arrow{display:flex;align-items:center;color:var(--sga-muted)}
.sga-split{display:grid;grid-template-columns:minmax(210px,290px) minmax(0,1fr);gap:14px}.sga-list{border:1px solid var(--sga-line);border-radius:14px;background:#0d1421;overflow:hidden}.sga-list-head{display:flex;gap:7px;padding:10px;border-bottom:1px solid var(--sga-line)}.sga-list-items{max-height:620px;overflow:auto;padding:8px}.sga-list-item{width:100%;text-align:left;border:1px solid transparent;border-radius:11px;background:transparent;color:var(--sga-text);padding:10px;cursor:pointer}.sga-list-item:hover{background:var(--sga-surface2)}.sga-list-item[data-selected="true"]{background:rgba(124,156,255,.12);border-color:rgba(124,156,255,.45)}.sga-list-item strong{display:block;font-size:12px}.sga-list-item span{display:block;color:var(--sga-muted);font-size:10px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sga-field{display:flex;flex-direction:column;gap:5px;margin-bottom:11px}.sga-field label{font-size:11px;font-weight:800;color:#cbd5e1}.sga-field small{color:var(--sga-muted);font-size:10px;line-height:1.45}.sga-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sga-row3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.sga-input,.sga-select,.sga-textarea{width:100%;border:1px solid var(--sga-line);border-radius:10px;background:#080d16;color:var(--sga-text);padding:9px 10px;font-size:12px;outline:none}.sga-input:focus,.sga-select:focus,.sga-textarea:focus{border-color:var(--sga-accent);box-shadow:0 0 0 3px rgba(124,156,255,.12)}.sga-textarea{min-height:110px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;line-height:1.45}.sga-textarea.tall{min-height:310px}.sga-textarea.preview{min-height:270px;color:#cbd5e1;background:#060a11}.sga-check{display:flex;align-items:center;gap:8px;font-size:12px;color:#dbe4f3}.sga-check input{width:17px;height:17px;accent-color:var(--sga-accent)}
.sga-actions{display:flex;gap:8px;flex-wrap:wrap}.sga-btn{border:1px solid var(--sga-line);border-radius:10px;background:var(--sga-surface3);color:var(--sga-text);padding:8px 11px;font-size:11px;font-weight:800;cursor:pointer}.sga-btn:hover{filter:brightness(1.15)}.sga-btn.primary{background:#4f67d8;border-color:#6f86f5}.sga-btn.good{background:#165c34;border-color:#25894f}.sga-btn.danger{background:#641f31;border-color:#9f3450}.sga-btn.ghost{background:transparent}.sga-btn:disabled{opacity:.45;cursor:not-allowed}
.sga-agent{display:flex;flex-direction:column;gap:11px;min-height:225px}.sga-agent-head{display:flex;justify-content:space-between;gap:10px}.sga-agent-index{display:inline-flex;width:25px;height:25px;align-items:center;justify-content:center;border-radius:8px;background:rgba(124,156,255,.14);color:#c7d2fe;font-size:11px;font-weight:900}.sga-agent-title{display:flex;align-items:center;gap:8px}.sga-agent-title h3{margin:0}.sga-agent-desc{color:var(--sga-muted);font-size:11px;line-height:1.5;min-height:48px}.sga-prompt-mode{margin-left:auto}
.sga-callout{border:1px solid #725815;border-radius:12px;background:rgba(251,191,36,.07);color:#fde68a;padding:11px;font-size:11px;line-height:1.5}.sga-callout.good{border-color:#166534;background:rgba(34,197,94,.07);color:#bbf7d0}.sga-callout.danger{border-color:#881337;background:rgba(244,63,94,.07);color:#fecdd3}.sga-divider{height:1px;background:var(--sga-line);margin:14px 0}.sga-code{white-space:pre-wrap;word-break:break-word;border:1px solid var(--sga-line);border-radius:12px;background:#060a11;padding:12px;color:#cbd5e1;font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;max-height:430px;overflow:auto}.sga-hidden{display:none!important}
.sga-phase{border:1px solid var(--sga-line);border-radius:16px;background:linear-gradient(180deg,rgba(23,32,51,.55),rgba(13,20,33,.55));padding:14px 14px 12px}.sga-phase+.sga-phase{margin-top:12px}.sga-phase-label{display:flex;align-items:center;gap:9px;margin-bottom:11px}.sga-phase-label .sga-phase-tag{font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#09101d;background:var(--sga-text);border-radius:999px;padding:3px 9px}.sga-phase-label .sga-phase-title{font-size:13px;font-weight:800;color:#dbe4f3}.sga-phase-label .sga-phase-sub{font-size:11px;color:var(--sga-muted);margin-left:auto}
.sga-flow-chain{display:flex;align-items:stretch;gap:0;overflow:auto;padding:4px 0}.sga-flow-chain .sga-flow-node{min-width:158px;flex:1;margin:0 6px}.sga-flow-chain .sga-arrow{font-size:18px;padding:0 2px;opacity:.65}.sga-flow-node{position:relative;border:1px solid var(--sga-line);border-radius:13px;padding:11px 12px;background:#0d1421;transition:border-color .15s,background .15s}.sga-flow-node .sga-flow-status{position:absolute;top:9px;right:9px}.sga-flow-node.state-ok{border-color:rgba(74,222,128,.55);background:rgba(74,222,128,.06)}.sga-flow-node.state-fallback{border-color:rgba(251,113,133,.55);background:rgba(251,113,133,.06)}.sga-flow-node.state-skip{border-color:rgba(154,168,191,.35);background:rgba(154,168,191,.04)}.sga-flow-node.state-run{border-color:rgba(124,156,255,.65);background:rgba(124,156,255,.08)}.sga-flow-node.state-run::after{content:'';position:absolute;inset:-2px;border-radius:15px;border:1.5px solid rgba(124,156,255,.55);animation:sga-pulse 1.4s ease-in-out infinite;pointer-events:none}@keyframes sga-pulse{0%,100%{opacity:.25}50%{opacity:.85}}.sga-flow-node.dim{opacity:.42}.sga-flow-node strong{display:block;font-size:12px}.sga-flow-node .sga-flow-meta{display:block;color:var(--sga-muted);font-size:10px;margin-top:4px;line-height:1.4}.sga-flow-node .sga-flow-elapsed{display:block;color:#7c9cff;font-size:10px;margin-top:3px;font-variant-numeric:tabular-nums}
.sga-handoff{display:flex;align-items:center;gap:8px;margin:-2px 0;padding:0 20px;color:var(--sga-muted);font-size:10px;font-weight:700}.sga-handoff::before{content:'';width:2px;height:14px;background:linear-gradient(180deg,transparent,var(--sga-line));border-radius:2px}.sga-handoff span{padding:2px 7px;border:1px dashed var(--sga-line);border-radius:999px;white-space:nowrap}
.sga-advanced{border:1px solid var(--sga-line);border-radius:12px;background:#080d16;margin-top:12px}.sga-advanced>summary{cursor:pointer;list-style:none;padding:10px 13px;font-size:11px;font-weight:800;color:#cbd5e1;display:flex;align-items:center;gap:7px}.sga-advanced>summary::-webkit-details-marker{display:none}.sga-advanced>summary::before{content:'▸';transition:transform .15s;color:var(--sga-muted)}.sga-advanced[open]>summary::before{transform:rotate(90deg)}.sga-advanced>summary .sga-advanced-hint{margin-left:auto;color:var(--sga-muted);font-weight:600;font-size:10px}.sga-advanced-body{padding:0 13px 13px}
.sga-summary-panel{border:1px solid var(--sga-line);border-radius:14px;background:rgba(13,20,33,.6);padding:12px 14px;margin-bottom:14px;display:flex;flex-direction:column;gap:6px}.sga-summary-row{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:0}.sga-summary-row+.sga-summary-row{margin-top:4px}.sga-summary-label{font-size:10px;font-weight:900;color:var(--sga-muted);text-transform:uppercase;letter-spacing:.04em;margin-right:2px}.sga-summary-empty{color:var(--sga-muted);font-size:11px;font-style:italic}.sga-summary-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--sga-line);border-radius:999px;padding:5px 9px;font-size:11px;font-weight:700;background:#0d1421}.sga-summary-pill .sga-summary-name{color:var(--sga-text)}.sga-summary-pill .sga-summary-state{font-size:10px;font-weight:900;padding:1px 6px;border-radius:999px;color:#cbd5e1;background:rgba(154,168,191,.12)}.sga-summary-pill.ok{border-color:rgba(34,197,94,.3)}.sga-summary-pill.ok .sga-summary-state{color:#bbf7d0;background:rgba(34,197,94,.12)}.sga-summary-pill.fallback{border-color:rgba(251,191,36,.3)}.sga-summary-pill.fallback .sga-summary-state{color:#fde68a;background:rgba(251,191,36,.12)}.sga-summary-pill.skip{border-color:rgba(244,63,94,.3)}.sga-summary-pill.skip .sga-summary-state{color:#fecdd3;background:rgba(244,63,94,.12)}.sga-summary-elapsed{color:#7c9cff;font-variant-numeric:tabular-nums;font-size:10px}.sga-inflight{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#c7d2fe;border:1px solid rgba(124,156,255,.5);border-radius:999px;padding:4px 9px;background:rgba(124,156,255,.08);align-self:flex-start}.sga-inflight::before{content:'';width:7px;height:7px;border-radius:50%;background:#7c9cff;animation:sga-pulse 1.2s ease-in-out infinite}
.sga-agent-run-meta{display:flex;align-items:flex-start;justify-content:flex-end;gap:6px;flex-wrap:wrap;min-width:150px}.sga-mini-badge{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--sga-line);border-radius:999px;padding:3px 7px;font-size:10px;font-weight:900;line-height:1.2;background:#080d16;color:#cbd5e1;white-space:nowrap}.sga-mini-badge.good{color:#bbf7d0;border-color:rgba(34,197,94,.45);background:rgba(34,197,94,.08)}.sga-mini-badge.warn{color:#fde68a;border-color:rgba(251,191,36,.45);background:rgba(251,191,36,.08)}.sga-mini-badge.danger{color:#fecdd3;border-color:rgba(251,113,133,.45);background:rgba(251,113,133,.08)}.sga-mini-badge.run{color:#c7d2fe;border-color:rgba(124,156,255,.5);background:rgba(124,156,255,.08)}.sga-mini-badge.off{color:var(--sga-muted);background:rgba(154,168,191,.05)}.sga-mini-badge .sga-mini-time{font-variant-numeric:tabular-nums;color:#93c5fd}.sga-stage-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(270px,.42fr);gap:14px;align-items:start}.sga-stage-controls{display:flex;flex-direction:column;gap:14px;min-width:0}.sga-stage-result{border:1px solid var(--sga-line);border-radius:13px;background:rgba(8,13,22,.66);padding:12px;min-width:0}.sga-stage-result-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}.sga-stage-result-title{font-size:11px;font-weight:900;color:#dbe4f3}.sga-result-row{border-top:1px solid rgba(43,56,80,.68);padding-top:8px;margin-top:8px}.sga-result-label{display:block;font-size:9px;font-weight:900;color:var(--sga-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}.sga-result-value{font-size:11px;line-height:1.55;color:#dbe4f3;overflow-wrap:anywhere}.sga-result-code{white-space:pre-wrap;word-break:break-word;border:1px solid rgba(43,56,80,.72);border-radius:10px;background:#060a11;padding:9px;color:#cbd5e1;font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;max-height:210px;overflow:auto}.sga-result-empty{color:var(--sga-muted);font-size:11px;line-height:1.5}.sga-stage-result details{margin-top:8px;border-top:1px dashed var(--sga-line);padding-top:8px}.sga-stage-result summary{cursor:pointer;color:#c7d2fe;font-size:10px;font-weight:800}.sga-stage-result details .sga-result-code{margin-top:7px;max-height:180px}
.sga-list-search{margin:8px;border:1px solid var(--sga-line);border-radius:10px;background:#080d16;color:var(--sga-text);padding:8px 10px;font-size:12px;outline:none;width:calc(100% - 16px)}.sga-list-search:focus{border-color:var(--sga-accent);box-shadow:0 0 0 3px rgba(124,156,255,.12)}
.sga-stack{display:flex;flex-direction:column;gap:0}.sga-stack .sga-card.sga-agent{margin:0}.sga-stack .sga-card.sga-agent+.sga-handoff{margin:0;padding:0 20px}.sga-stack .sga-card.sga-agent.dim{opacity:.5}
.sga-row4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.sga-provider-editor{min-width:0}.sga-provider-panels{display:flex;flex-direction:column;gap:12px}.sga-provider-panel{border:1px solid var(--sga-line);border-radius:14px;background:rgba(8,13,22,.7);padding:14px}.sga-provider-panel.vertex{border-color:rgba(124,156,255,.5);background:rgba(124,156,255,.055)}.sga-provider-panel.reasoning{border-color:rgba(74,222,128,.32)}.sga-provider-panel.flex{border-color:rgba(251,191,36,.36);background:rgba(251,191,36,.035)}.sga-provider-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.sga-provider-panel-head h3{margin:0;font-size:14px}.sga-provider-panel-head p{margin:4px 0 0;color:var(--sga-muted);font-size:11px;line-height:1.5}.sga-provider-actions{margin-top:14px;padding-top:14px;border-top:1px solid var(--sga-line)}.sga-provider-note-box{display:flex;flex-direction:column;gap:4px;border:1px solid var(--sga-line);border-radius:11px;background:#080d16;padding:10px 12px;min-width:0}.sga-provider-note-box strong{font-size:10px;color:var(--sga-muted);text-transform:uppercase;letter-spacing:.04em}.sga-provider-note-box span{font-size:12px;color:#dbe4f3;overflow-wrap:anywhere}
.sga-flow-page{display:flex;flex-direction:column;gap:24px}.sga-flow-page-title{margin-bottom:-8px}.sga-flow-overview{display:grid;grid-template-columns:repeat(9,minmax(115px,1fr));gap:7px;overflow:auto;padding:2px 0 8px;scrollbar-width:thin}.sga-flow-mini{position:relative;border:1px solid rgba(74,222,128,.35);border-radius:12px;background:rgba(74,222,128,.045);padding:9px 10px;min-width:115px}.sga-flow-mini:not(:last-child)::after{content:'›';position:absolute;right:-7px;top:50%;transform:translateY(-50%);z-index:2;color:var(--sga-muted);font-size:16px}.sga-flow-mini.main{border-color:rgba(124,156,255,.58);background:rgba(124,156,255,.08)}.sga-flow-mini.analysis{border-color:rgba(251,191,36,.45);background:rgba(251,191,36,.06)}.sga-flow-mini.off{opacity:.42;border-color:var(--sga-line);background:#080d16}.sga-flow-mini strong{display:block;font-size:10px;white-space:nowrap}.sga-flow-mini span{display:block;margin-top:4px;color:var(--sga-muted);font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sga-flow-section{scroll-margin-top:190px}.sga-flow-section+.sga-flow-section{margin-top:4px}.sga-flow-major-handoff{justify-content:center;margin:-10px 0;padding:0}.sga-flow-major-handoff::before{height:28px}.sga-flow-major-handoff span{font-size:11px;color:#c7d2fe;border-color:rgba(124,156,255,.45);background:rgba(124,156,255,.05)}.sga-flow-handoff{justify-content:center}.sga-debug-fold{margin-top:2px}.sga-debug-fold>.sga-advanced-body{padding-top:4px}
.sga-agent-expanded{min-height:0;padding:18px;gap:14px}.sga-agent-desc.compact{min-height:0}.sga-agent-expanded.dim{opacity:.52}.sga-analysis-agent{border-color:rgba(251,191,36,.36);background:rgba(251,191,36,.035)}.sga-stage-primary{display:grid;grid-template-columns:minmax(150px,.65fr) minmax(220px,1.2fr) minmax(220px,1.2fr);gap:12px;align-items:start;border-top:1px solid var(--sga-line);padding-top:13px}.sga-stage-primary>.sga-check{padding-top:27px}.sga-stage-detail{border:1px solid var(--sga-line);border-radius:13px;background:rgba(8,13,22,.62);padding:13px}.sga-stage-detail-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:11px}.sga-stage-detail-head strong{font-size:12px}.sga-stage-detail-head span{font-size:10px;color:var(--sga-muted)}.sga-reference-box{border-top:1px dashed var(--sga-line);margin-top:2px;padding-top:12px}.sga-reference-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.sga-reference-head strong{font-size:11px}.sga-reference-head span{font-size:10px;color:var(--sga-muted)}.sga-reference-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px 12px;margin-bottom:8px}.sga-prompt-builtin{display:flex;flex-direction:column;gap:2px}.sga-textarea.stage-prompt{min-height:230px}.sga-main-response-card{border-color:rgba(124,156,255,.56);background:linear-gradient(180deg,rgba(37,51,85,.9),rgba(17,24,39,.94))}.sga-agent-index.main{background:rgba(124,156,255,.28);color:#eef2ff}.sga-main-response-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:3px 0 10px}.sga-runtime-legacy{margin-top:14px}
@media(max-width:1100px){.sga-stage-layout{grid-template-columns:1fr}.sga-agent-run-meta{justify-content:flex-start}.sga-stage-result{order:2}}
html{scroll-behavior:smooth}
.sga-app{position:relative}
.sga-top{padding:22px 28px;border-bottom:1px solid rgba(124,156,255,.18);background:linear-gradient(180deg,rgba(8,12,21,.96),rgba(8,12,21,.9));box-shadow:0 16px 50px rgba(0,0,0,.22)}
.sga-brand h1{font-size:28px;font-weight:900;letter-spacing:-.03em}.sga-brand p{margin-top:7px;font-size:13px;color:#a8b5cc}
.sga-head-actions .sga-btn{padding:10px 14px;border-radius:12px}.sga-head-actions .sga-btn.good{background:linear-gradient(135deg,#7c5cff,#6b7cff);border-color:#8a79ff}.sga-dirty{padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.03)}
.sga-tabs{top:95px;gap:10px;padding:14px 28px;border-bottom:0;background:transparent}.sga-tab{padding:10px 16px;border-radius:14px;background:rgba(17,24,39,.9);border-color:rgba(124,156,255,.16);box-shadow:0 10px 24px rgba(0,0,0,.12)}.sga-tab[data-active="true"]{background:linear-gradient(135deg,#7c5cff,#4d7dff);border-color:rgba(255,255,255,.12);color:#fff}
.sga-main{max-width:1440px;padding:26px 28px 88px}.sga-status{margin-bottom:14px;padding:10px 14px;border:1px solid rgba(124,156,255,.12);border-radius:14px;background:rgba(10,16,27,.72);backdrop-filter:blur(10px)}.sga-status:empty{display:none}
.sga-card{border:1px solid rgba(124,156,255,.14);border-radius:20px;background:linear-gradient(180deg,rgba(18,25,40,.95),rgba(10,16,27,.92));padding:18px;box-shadow:0 18px 48px rgba(0,0,0,.18)}
.sga-section-title h2{font-size:24px;letter-spacing:-.02em}.sga-section-title p{font-size:13px;color:#a9b6cd}
.sga-flow-page{gap:20px}
.sga-glance-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.sga-glance-card{position:relative;overflow:hidden;padding:18px 18px 16px;border:1px solid rgba(124,156,255,.16);border-radius:18px;background:linear-gradient(180deg,rgba(16,24,38,.95),rgba(11,17,28,.92));box-shadow:0 14px 34px rgba(0,0,0,.16)}.sga-glance-card::after{content:'';position:absolute;inset:auto -18% -52% auto;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(124,156,255,.24),transparent 62%);pointer-events:none}.sga-glance-card.accent-purple::after{background:radial-gradient(circle,rgba(124,92,255,.28),transparent 62%)}.sga-glance-card.accent-green::after{background:radial-gradient(circle,rgba(16,185,129,.24),transparent 62%)}.sga-glance-card.accent-amber::after{background:radial-gradient(circle,rgba(245,158,11,.22),transparent 62%)}.sga-glance-card.accent-blue::after{background:radial-gradient(circle,rgba(77,125,255,.24),transparent 62%)}
.sga-glance-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}.sga-glance-title{font-size:12px;font-weight:800;color:#dbe4f3}.sga-glance-kicker{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;color:#c7d2fe;padding:5px 9px;border-radius:999px;background:rgba(124,156,255,.1);border:1px solid rgba(124,156,255,.18)}.sga-glance-value{font-size:34px;line-height:1;font-weight:900;letter-spacing:-.03em;margin-bottom:8px}.sga-glance-label{font-size:12px;color:#9fb0cb;line-height:1.5}.sga-glance-meta{margin-top:12px;font-size:11px;color:#d7e0f1}
.sga-quicknav{display:flex;flex-wrap:wrap;gap:10px;margin:4px 0 2px}.sga-quicknav-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 14px;border-radius:13px;border:1px solid rgba(124,156,255,.14);background:rgba(13,20,33,.76);color:#d8e2f2;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 12px 28px rgba(0,0,0,.12)}.sga-quicknav-btn:hover{background:rgba(124,156,255,.12);border-color:rgba(124,156,255,.28)}
.sga-flow-overview-card{padding:16px 16px 14px}.sga-flow-overview-card .sga-agent-head{margin-bottom:10px}.sga-flow-overview{grid-template-columns:repeat(9,minmax(120px,1fr));gap:8px;padding:0}.sga-flow-mini{border-radius:14px;padding:11px 12px;min-width:120px}.sga-flow-mini strong{font-size:11px}.sga-flow-mini span{font-size:10px}
.sga-flow-section{scroll-margin-top:210px}.sga-flow-major-handoff span,.sga-flow-handoff span{background:rgba(124,156,255,.06);border-color:rgba(124,156,255,.25)}
.sga-provider-panel,.sga-stage-detail,.sga-stage-result,.sga-provider-note-box{border-color:rgba(124,156,255,.12);border-radius:16px}
.sga-input,.sga-select,.sga-textarea,.sga-list-search{border-color:rgba(124,156,255,.14);border-radius:12px;background:rgba(5,10,18,.9);padding:10px 12px}.sga-field label{font-size:11px;letter-spacing:.02em}.sga-btn{border-radius:12px;padding:9px 12px}.sga-btn.primary{background:linear-gradient(135deg,#7c5cff,#4d7dff);border-color:#7f8fff}.sga-btn.good{background:linear-gradient(135deg,#256b45,#2d8a58);border-color:#43b072}.sga-btn.danger{background:linear-gradient(135deg,#6d2134,#953150);border-color:#b94d6e}
.sga-stage-layout{gap:16px}.sga-agent-expanded{padding:20px;border-radius:20px}.sga-main-response-card{border-radius:20px}
@media(max-width:1100px){.sga-stage-layout{grid-template-columns:1fr}.sga-agent-run-meta{justify-content:flex-start}.sga-stage-result{order:2}.sga-glance-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
html{scroll-behavior:smooth}
@media(max-width:900px){.sga-grid,.sga-grid.three,.sga-row3,.sga-row4,.sga-reference-grid,.sga-main-response-grid,.sga-glance-grid{grid-template-columns:1fr}.sga-stage-primary{grid-template-columns:1fr}.sga-stage-primary>.sga-check{padding-top:0}.sga-flow-overview{grid-template-columns:repeat(9,135px)}.sga-split{grid-template-columns:1fr}.sga-row2{grid-template-columns:1fr}.sga-top{align-items:flex-start;padding:18px}.sga-tabs{top:112px;padding:10px 18px}.sga-main{padding:18px 18px 72px}.sga-flow-node{min-width:135px}.sga-tabs .sga-tab{padding:8px 12px;font-size:11px}.sga-tab .sga-tab-full{display:none}.sga-tab .sga-tab-short{display:inline}.sga-phase-label .sga-phase-sub{display:none}.sga-brand h1{font-size:21px}.sga-brand p{font-size:11px}}
@media(max-width:560px){.sga-provider-panel-head{flex-direction:column}.sga-brand h1{font-size:18px}.sga-brand p{font-size:10px}.sga-head-actions{flex-wrap:wrap}.sga-summary-pill{font-size:10px;padding:4px 7px}.sga-quicknav{overflow:auto;flex-wrap:nowrap;padding-bottom:2px}}
`;
    document.head.appendChild(style);
  };

  const guiEl = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'checked') node.checked = !!value;
      else if (key === 'value') node.value = value == null ? '' : String(value);
      else if (key === 'onClick') node.addEventListener('click', value);
      else if (key === 'onChange') node.addEventListener('change', value);
      else if (key === 'onInput') node.addEventListener('input', value);
      else if (key === 'dataset') Object.assign(node.dataset, value || {});
      else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
      else if (key === 'selected') node.selected = !!value;
      else if (key === 'disabled') node.disabled = !!value;
      else if (value !== false && value != null) node.setAttribute(key, value === true ? '' : String(value));
    }
    for (const child of (Array.isArray(children) ? children : [children])) {
      if (child == null) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  };

  const guiSetStatus = (message, isError = false, sticky = false) => {
    const node = Gui.app?.querySelector('[data-gui-status]');
    if (!node) return;
    node.textContent = message || '';
    node.classList.toggle('err', !!isError);
    if (Gui.statusTimer) clearTimeout(Gui.statusTimer);
    if (!sticky && message) Gui.statusTimer = setTimeout(() => { node.textContent = ''; node.classList.remove('err'); }, 6500);
  };

  const copyTextWithFallback = async (value) => {
    const body = text(value || '');
    let lastError = '';
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
        await navigator.clipboard.writeText(body);
        return { ok: true, method: 'clipboard' };
      }
    } catch (error) {
      lastError = error?.message || String(error);
    }
    try {
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function' && document.body) {
        const area = document.createElement('textarea');
        area.value = body;
        area.setAttribute('readonly', 'readonly');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        area.style.top = '0';
        document.body.appendChild(area);
        if (typeof area.focus === 'function') area.focus();
        if (typeof area.select === 'function') area.select();
        const ok = document.execCommand('copy');
        if (typeof area.remove === 'function') area.remove();
        else if (area.parentNode) area.parentNode.removeChild(area);
        if (ok) return { ok: true, method: 'execCommand' };
      }
    } catch (error) {
      lastError = lastError || error?.message || String(error);
    }
    return { ok: false, error: lastError || 'Clipboard API is unavailable or blocked by permissions policy.' };
  };

  const optionNodes = (items, selected) => items.map(item => {
    const pair = Array.isArray(item) ? item : [item, item];
    return guiEl('option', { value: pair[0], text: pair[1], selected: String(pair[0]) === String(selected ?? '') });
  });

  const inputNode = (value, onInput, options = {}) => guiEl(options.tag || 'input', {
    type: options.type || (options.tag === 'textarea' ? null : 'text'),
    class: options.tag === 'textarea' ? `sga-textarea ${options.class || ''}` : 'sga-input',
    value: value ?? '',
    placeholder: options.placeholder || '',
    min: options.min,
    max: options.max,
    step: options.step,
    autocomplete: options.autocomplete,
    onInput: event => { onInput(event.target.value, event); markGuiDirty(); }
  });

  const selectNode = (value, items, onChange) => {
    const selectedValue = value == null ? '' : String(value);
    let lastCommittedValue = selectedValue;
    const commit = event => {
      const nextValue = event?.target ? event.target.value : selectedValue;
      if (nextValue === lastCommittedValue) return;
      lastCommittedValue = nextValue;
      onChange(nextValue, event);
      markGuiDirty();
    };
    const node = guiEl('select', {
      class: 'sga-select',
      value: selectedValue,
      onChange: commit,
      onInput: commit
    }, optionNodes(items, selectedValue));
    try { node.value = selectedValue; } catch (_) {}
    return node;
  };

  const checkboxNode = (checked, label, onChange) => guiEl('label', { class: 'sga-check' }, [
    guiEl('input', { type: 'checkbox', checked, onChange: event => { onChange(!!event.target.checked, event); markGuiDirty(); } }),
    guiEl('span', { text: label })
  ]);

  const fieldNode = (label, control, note = '') => guiEl('div', { class: 'sga-field' }, [
    guiEl('label', { text: label }), control, note ? guiEl('small', { text: note }) : null
  ]);

  const providerChoices = () => {
    const builtIn = ['openai','claude','gemini','openrouter','deepseek','lmstudio','ollama','ollama_cloud','nanogpt','vertex','vertex-openai','copilot'];
    const direct = Object.keys(DIRECT_LLM_PROVIDER_REGISTRY).filter(id => !builtIn.includes(id));
    return [...builtIn, ...direct, 'custom'].map(id => [id, `${providerDisplayLabel(id)} (${id})`]);
  };

  const presetNamesFromState = () => Object.keys(Gui.state?.providers || {}).sort((a, b) => a === 'default' ? -1 : b === 'default' ? 1 : a.localeCompare(b));
  const presetChoicesFromState = (includeDefaultFallback = true) => [
    ...(includeDefaultFallback ? [['', '(전역 기본 프리셋 사용)']] : []),
    ...presetNamesFromState().map(name => [name, name])
  ];

  const resolvedPresetNameForStage = (stageId) => {
    const custom = (Gui.state?.agents?.customAnalysisAgents || []).find(agent => agent.id === stageId);
    const customPost = (Gui.state?.posts?.customPostAgents || []).find(agent => agent.id === stageId);
    const slot = Gui.state?.agents?.[stageId] || Gui.state?.posts?.[stageId] || custom || customPost || {};
    return slot.presetName || Gui.state?.runtime?.defaultPresetName || 'default';
  };

  const isStageConfiguredInGui = stageId => {
    const name = resolvedPresetNameForStage(stageId);
    return providerConfigured(Gui.state?.providers?.[name] || Gui.state?.providers?.default || {});
  };

  const uniquePresetName = (base = '새 프리셋') => {
    const bank = Gui.state?.providers || {};
    if (!bank[base]) return base;
    let index = 2;
    while (bank[`${base} ${index}`]) index += 1;
    return `${base} ${index}`;
  };

  const addGuiPreset = () => {
    const name = uniquePresetName('새 프리셋');
    Gui.state.providers[name] = sanitizePreset({ provider: 'openai', url: defaultUrlForProvider('openai'), model: '', temp: 0.35, max_tokens: DEFAULT_MAX_STAGE_TOKENS, timeout_ms: DEFAULT_STAGE_TIMEOUT_MS, request_format: 'chat_completions', reasoning_preset: 'auto', thinking_type: 'enabled' });
    Gui.selectedPreset = name;
    markGuiDirty();
    renderSettingsGui();
  };

  const renameGuiPreset = (nextName) => {
    const oldName = Gui.selectedPreset;
    const cleanName = String(nextName || '').trim();
    if (!cleanName) throw new Error('프리셋 이름이 필요합니다.');
    if (cleanName !== oldName && Gui.state.providers[cleanName]) throw new Error('같은 이름의 프리셋이 이미 있습니다.');
    if (cleanName === oldName) return;
    Gui.state.providers[cleanName] = Gui.state.providers[oldName];
    delete Gui.state.providers[oldName];
    if (Gui.state.runtime.defaultPresetName === oldName) Gui.state.runtime.defaultPresetName = cleanName;
    const beforeSlots = BEFORE_STAGE_DEFS.map(def => Gui.state.agents?.[def.id]).filter(Boolean);
    for (const slot of [...beforeSlots, ...(Gui.state.agents?.customAnalysisAgents || []), ...(Gui.state.posts?.customPostAgents || [])]) {
      if (slot.presetName === oldName) slot.presetName = cleanName;
    }
    Gui.selectedPreset = cleanName;
    markGuiDirty();
  };

  const deleteGuiPreset = () => {
    const names = presetNamesFromState();
    if (names.length <= 1) throw new Error('최소 1개의 프로바이더 프리셋은 남겨야 합니다.');
    const target = Gui.selectedPreset;
    delete Gui.state.providers[target];
    const fallback = Gui.state.providers.default ? 'default' : Object.keys(Gui.state.providers)[0];
    if (Gui.state.runtime.defaultPresetName === target) Gui.state.runtime.defaultPresetName = fallback;
    const beforeSlots = BEFORE_STAGE_DEFS.map(def => Gui.state.agents?.[def.id]).filter(Boolean);
    for (const slot of [...beforeSlots, ...(Gui.state.agents?.customAnalysisAgents || []), ...(Gui.state.posts?.customPostAgents || [])]) {
      if (slot.presetName === target) slot.presetName = '';
    }
    Gui.selectedPreset = fallback;
    markGuiDirty();
  };

  const buildOverviewTab = () => {
    const state = Gui.state;
    const providerNames = presetNamesFromState();
    const beforeEnabled = BEFORE_STAGE_DEFS.filter(def => state.agents?.[def.id]?.enabled).length;
    const customAnalysisEnabled = (state.agents?.customAnalysisAgents || []).filter(agent => agent.enabled).length;
    const customPostAgents = state.posts?.customPostAgents || [];
    const postEnabled = customPostAgents.filter(agent => agent.enabled).length;
    const configured = providerNames.filter(name => providerConfigured(state.providers[name])).length;
    const warnings = [];
    if (!state.agents?.shadow_act?.enabled) warnings.push('SHADOW ACT가 꺼져 있어 응답 전 파이프라인 전체가 실행되지 않습니다.');
    for (const def of ALL_STAGE_DEFS) {
      const slot = state.agents?.[def.id] || state.posts?.[def.id];
      if (slot?.enabled && !isStageConfiguredInGui(def.id)) warnings.push(`${def.label}: 사용할 프로바이더 프리셋이 완전히 설정되지 않았습니다.`);
    }
    for (const agent of (state.agents?.customAnalysisAgents || [])) {
      if (agent.enabled && !isStageConfiguredInGui(agent.id)) warnings.push(`${agent.label}: 분석 에이전트 프리셋이 완전히 설정되지 않았습니다.`);
      if (agent.enabled && !compact(agent.prompt, 1)) warnings.push(`${agent.label}: 분석 지시가 비어 있습니다.`);
    }
    for (const agent of customPostAgents) {
      if (agent.enabled && !isStageConfiguredInGui(agent.id)) warnings.push(`${agent.label}: 후속 편집 에이전트 프리셋이 완전히 설정되지 않았습니다.`);
      if (agent.enabled && !compact(agent.prompt, 1)) warnings.push(`${agent.label}: 후속 편집 지시가 비어 있습니다.`);
    }
    if (state.runtime.afterProcessMode === 'off' && postEnabled) warnings.push('후속 편집 에이전트가 켜져 있지만 전체 후속 처리 모드는 꺼짐입니다.');

    const traceMap = new Map();
    for (const t of (Runtime.stageTrace || [])) {
      if (t?.stage) traceMap.set(t.stage, t);
    }
    for (const t of (Runtime.postTrace || [])) {
      if (t?.stage) traceMap.set(t.stage, t);
    }
    const nodeState = (defId, enabled, kind) => {
      const trace = traceMap.get(defId);
      const running = kind === 'post' ? Runtime.postInFlight : Runtime.inFlight;
      if (running && !trace && enabled) return 'run';
      if (!enabled) return 'skip';
      if (!trace) return '';
      if (trace.skipped) return 'skip';
      if (trace.ok === false || trace.fallback || trace.fallbackStage || trace.parsed?.fallback) return 'fallback';
      return 'ok';
    };
    const stateLabel = (state) => state === 'ok' ? '성공' : state === 'fallback' ? '폴백' : state === 'skip' ? '건너뜀' : state === 'run' ? '실행 중' : '대기';
    const flowNode = (def, kind) => {
      const custom = def.customAnalysis ? (state.agents?.customAnalysisAgents || []).find(agent => agent.id === def.id) : null;
      const customPost = def.customPost ? customPostAgents.find(agent => agent.id === def.id) : null;
      const enabled = custom ? custom.enabled : customPost ? customPost.enabled : (kind === 'before' ? state.agents?.[def.id]?.enabled : state.posts?.[def.id]?.enabled);
      const state2 = nodeState(def.id, enabled, kind);
      const trace = traceMap.get(def.id);
      const isLiteSkip = kind === 'before' && state.runtime.mode === 'lite' && (def.id === 'aide_character' || def.id === 'aide_world');
      const dim = isLiteSkip || (kind === 'before' && !enabled && def.id !== 'shadow_act');
      const classes = `sga-flow-node state-${state2 || 'idle'}${dim ? ' dim' : ''}`;
      const meta = custom
        ? `${enabled ? '분석 사용' : '분석 끔'} · ${resolvedPresetNameForStage(def.id)}`
        : customPost
        ? `${enabled ? '편집 사용' : '편집 끔'} · ${resolvedPresetNameForStage(def.id)}`
        : `${enabled ? '사용' : '끔'} · ${resolvedPresetNameForStage(def.id)}`;
      const elapsed = trace?.elapsedMs ? `${trace.elapsedMs}ms` : '';
      return guiEl('div', { class: classes }, [
        guiEl('div', { class: 'sga-flow-status' }, [guiEl('span', { class: `sga-badge ${state2 === 'ok' ? 'good' : state2 === 'fallback' ? 'warn' : state2 === 'run' ? 'warn' : 'off'}`, text: stateLabel(state2) })]),
        guiEl('strong', { text: def.label }),
        guiEl('span', { class: 'sga-flow-meta', text: isLiteSkip ? '라이트 모드 건너뜀 · ' + meta : meta }),
        elapsed ? guiEl('span', { class: 'sga-flow-elapsed', text: elapsed }) : null
      ]);
    };

    const postNodes = [];
    customPostAgents.forEach((agent, index) => {
      const def = customPostDef(agent, index);
      if (index) postNodes.push(guiEl('div', { class: 'sga-arrow', text: '→' }));
      postNodes.push(flowNode(def, 'post'));
    });

    const mainNode = guiEl('div', { class: 'sga-flow-node' }, [
      guiEl('strong', { text: 'RisuAI 메인 모델' }),
      guiEl('span', { class: 'sga-flow-meta', text: '최종 RP 응답 생성' })
    ]);

    return guiEl('div', {}, [
      guiEl('div', { class: 'sga-section-title' }, [guiEl('h2', { text: '개요' }), guiEl('p', { text: 'SHADOW ACT가 초안을 만들면 인물 → 세계관 → 플롯 AIDE가 같은 초안을 직렬로 재작성해 메인 모델에 전달합니다.' })]),
      guiEl('div', { class: 'sga-grid three' }, [
        guiEl('div', { class: 'sga-card' }, [guiEl('div', { class: 'sga-stat' }, [guiEl('div', {}, [guiEl('div', { class: 'sga-stat-value', text: `${configured}/${providerNames.length}` }), guiEl('div', { class: 'sga-stat-label', text: '사용 가능한 프로바이더 프리셋' })]), guiEl('span', { class: `sga-badge ${configured ? 'good' : 'warn'}`, text: configured ? '준비됨' : '설정 필요' })])]),
        guiEl('div', { class: 'sga-card' }, [guiEl('div', { class: 'sga-stat' }, [guiEl('div', {}, [guiEl('div', { class: 'sga-stat-value', text: `${beforeEnabled}/4 + ${customAnalysisEnabled}` }), guiEl('div', { class: 'sga-stat-label', text: '응답 전 / 분석' })]), guiEl('span', { class: 'sga-badge good', text: state.runtime.mode })])]),
        guiEl('div', { class: 'sga-card' }, [guiEl('div', { class: 'sga-stat' }, [guiEl('div', {}, [guiEl('div', { class: 'sga-stat-value', text: `${postEnabled}/${customPostAgents.length}` }), guiEl('div', { class: 'sga-stat-label', text: '응답 후 편집' })]), guiEl('span', { class: `sga-badge ${state.runtime.afterProcessMode === 'off' ? 'off' : 'good'}`, text: state.runtime.afterProcessMode })])])
      ]),
      guiEl('div', { class: 'sga-card wide', style: { marginTop: '14px' } }, [
        guiEl('div', { class: 'sga-agent-head' }, [guiEl('h3', { text: '직렬 점층 실행 흐름' }), Runtime.inFlight ? guiEl('span', { class: 'sga-inflight', text: '파이프라인 실행 중' }) : null]),
        guiEl('div', { class: 'sga-phase', style: { marginTop: '12px' } }, [
          guiEl('div', { class: 'sga-phase-label' }, [guiEl('span', { class: 'sga-phase-tag', text: '응답 전' }), guiEl('span', { class: 'sga-phase-title', text: '직렬 드래프트 점층 체인' }), guiEl('span', { class: 'sga-phase-sub', text: '이전 단계 초안을 받아 분석 후 전체 재작성' })]),
          guiEl('div', { class: 'sga-flow-chain', style: { flexDirection: 'column', gap: '0' } }, (() => {
            const chain = [];
            BEFORE_STAGE_DEFS.forEach((def, index) => {
              if (index) chain.push(guiEl('div', { class: 'sga-handoff', style: { padding: '4px 18px' } }, [guiEl('span', { text: '↓ 이전 초안 전달' })]));
              chain.push(flowNode(def, 'before'));
              (state.agents?.customAnalysisAgents || []).forEach((agent, agentIndex) => {
                if (agent.insertAfter !== def.id) return;
                chain.push(guiEl('div', { class: 'sga-handoff', style: { padding: '4px 18px' } }, [guiEl('span', { text: '↓ 분석만 수행 / 초안 유지' })]));
                chain.push(flowNode(customAnalysisDef(agent, agentIndex), 'before'));
              });
            });
            return chain;
          })())
        ]),
        guiEl('div', { class: 'sga-arrow', style: { textAlign: 'center', padding: '8px 0', fontSize: '20px' }, text: '↓' }),
        guiEl('div', { class: 'sga-phase' }, [
          guiEl('div', { class: 'sga-phase-label' }, [guiEl('span', { class: 'sga-phase-tag', text: '생성' }), guiEl('span', { class: 'sga-phase-title', text: 'RisuAI 메인 모델' }), guiEl('span', { class: 'sga-phase-sub', text: '최종 초안을 받아 실제 RP 응답 생성' })]),
          guiEl('div', { class: 'sga-flow-chain' }, [mainNode])
        ]),
        guiEl('div', { class: 'sga-arrow', style: { textAlign: 'center', padding: '8px 0', fontSize: '20px' }, text: '↓' }),
        guiEl('div', { class: 'sga-phase' }, [
          guiEl('div', { class: 'sga-phase-label' }, [guiEl('span', { class: 'sga-phase-tag', text: '응답 후' }), guiEl('span', { class: 'sga-phase-title', text: '커스텀 후속 편집 체인' }), guiEl('span', { class: 'sga-phase-sub', text: state.runtime.afterProcessMode === 'off' ? '현재 꺼져 있음' : 'RisuAI 응답을 순차적으로 수정·확장' })]),
          postNodes.length ? guiEl('div', { class: 'sga-flow-chain' }, postNodes) : guiEl('div', { class: 'sga-callout', text: '후속 편집 에이전트가 없습니다. 필요한 만큼 직접 추가하세요.' })
        ])
      ]),
      guiEl('div', { class: 'sga-grid', style: { marginTop: '14px' } }, [
        guiEl('div', { class: 'sga-card' }, [
          guiEl('h3', { text: '빠른 이동' }),
          guiEl('div', { class: 'sga-actions' }, [
            guiEl('button', { class: 'sga-btn primary', text: '프로바이더 설정', onClick: () => { Gui.activeTab = 'providers'; renderSettingsGui(); } }),
            guiEl('button', { class: 'sga-btn', text: '응답 전 에이전트', onClick: () => { Gui.activeTab = 'agents'; renderSettingsGui(); } }),
            guiEl('button', { class: 'sga-btn', text: '후속 편집', onClick: () => { Gui.activeTab = 'post'; renderSettingsGui(); } }),
            guiEl('button', { class: 'sga-btn', text: '프롬프트', onClick: () => { Gui.activeTab = 'prompts'; renderSettingsGui(); } })
          ]),
          guiEl('div', { class: 'sga-divider' }),
          guiEl('div', { class: 'sga-note', text: `비밀 키 저장소: ${['localPluginStorage','safeLocalStorage'].includes(Runtime.secretStorage) ? '기기 로컬 저장소' : Runtime.secretStorage === 'unavailable' ? '사용 불가(비밀 키 저장 안 함)' : '확인 중'} · GUI 설정은 save-file별 pluginStorage에 저장됩니다.` })
        ]),
        guiEl('div', { class: 'sga-card' }, [
          guiEl('h3', { text: '상태 점검' }),
          ...(warnings.length ? warnings.map(message => guiEl('div', { class: 'sga-callout', text: message, style: { marginBottom: '7px' } })) : [guiEl('div', { class: 'sga-callout good', text: '현재 설정에서 발견된 명백한 배치 오류가 없습니다.' })])
        ])
      ])
    ]);
  };

  const providerEditorField = (label, key, options = {}) => {
    const preset = Gui.state.providers[Gui.selectedPreset];
    const value = preset?.[key] ?? '';
    let control;
    if (options.choices) {
      control = selectNode(value, options.choices, next => {
        const oldProvider = preset.provider;
        preset[key] = next;
        if (key === 'provider') {
          const oldDefault = defaultUrlForProvider(oldProvider);
          if (!preset.url || preset.url === oldDefault) preset.url = defaultUrlForProvider(next);
          preset.provider = canonicalProvider(next);
          renderSettingsGui();
        } else if (key === 'reasoning_preset') {
          renderSettingsGui();
        }
      });
    } else if (options.checkbox) {
      control = checkboxNode(!!value, options.checkboxLabel || '사용', next => { preset[key] = next; });
    } else {
      control = inputNode(value, next => { preset[key] = options.number ? Number(next) : next; }, {
        tag: options.textarea ? 'textarea' : 'input', type: options.number ? 'number' : (options.type || 'text'), class: options.tall ? 'tall' : '', placeholder: options.placeholder || '', autocomplete: options.autocomplete
      });
    }
    return fieldNode(label, control, options.note || '');
  };

  const isVertexProvider = (provider) => ['vertex', 'vertex-openai'].includes(canonicalProvider(provider));

  const inferReasoningFamily = (preset = {}) => effectiveReasoningFamilyForPreset(preset);

  const applyVertexCredentialsToPreset = (preset, rawText, allowPlainToken = false) => {
    const raw = text(rawText || '').trim();
    if (!raw) throw new Error('Vertex JSON 또는 토큰을 입력하세요.');
    const parsed = tryJsonParse(raw, null);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      if (!allowPlainToken) throw new Error('유효한 Vertex JSON 객체가 아닙니다.');
      preset.key = stripBearerPrefix(raw);
      preset.secret_deleted = false;
      return { kind: 'token', projectId: '', location: '' };
    }
    const projectId = text(parsed.project_id || parsed.projectId || parsed.quota_project_id || '').trim();
    const location = text(parsed.location || parsed.region || parsed.vertex_location || 'global').trim() || 'global';
    preset.key = JSON.stringify(parsed);
    preset.secret_deleted = false;
    let url = defaultUrlForProvider(preset.provider);
    if (projectId) url = url.replace(/PROJECT_ID|\{project_id\}|\$\{project_id\}/g, projectId);
    url = url.replace(/\/locations\/[^/]+\//i, `/locations/${location}/`);
    preset.url = url;
    return { kind: parsed.access_token || parsed.token ? 'access_token_json' : 'service_account_json', projectId, location };
  };

  const providerPanel = (title, note, children, className = '') => guiEl('section', { class: `sga-provider-panel ${className}`.trim() }, [
    guiEl('div', { class: 'sga-provider-panel-head' }, [
      guiEl('h3', { text: title }),
      note ? guiEl('p', { text: note }) : null
    ]),
    ...children
  ]);

  const buildReasoningPanel = (preset) => {
    const effective = inferReasoningFamily(preset);
    const quickButton = (label, patch) => guiEl('button', {
      class: 'sga-btn ghost',
      text: label,
      onClick: () => { Object.assign(preset, patch); markGuiDirty(); renderSettingsGui(); }
    });
    const choices = REASONING_PRESET_KEYS.map(key => [key, REASONING_PRESETS[key].label]);
    const fields = [
      guiEl('div', { class: 'sga-row2' }, [
        providerEditorField('추론 프리셋', 'reasoning_preset', { choices }),
        guiEl('div', { class: 'sga-note sga-provider-note-box', text: `실제 적용: ${effective.toUpperCase()} · ${REASONING_PRESETS[effective]?.hint || ''}` })
      ])
    ];
    if (['gpt','openrouter','claude','gemini','ollama'].includes(effective)) {
      fields.push(providerEditorField('Reasoning effort', 'reasoning_effort', { choices: [['none','없음'],['low','낮음'],['medium','중간'],['high','높음']] }));
    }
    if (['openrouter','claude_budget','gemini_budget'].includes(effective)) {
      fields.push(providerEditorField('Thinking / Reasoning 예산 토큰', 'reasoning_budget_tokens', { number: true, note: effective === 'gemini_budget' ? '-1은 dynamic, 0은 off입니다.' : '출력 토큰 상한 안에서 최종 답변 공간을 남기도록 자동 제한합니다.' }));
    }
    if (['openrouter','claude','claude_budget','gemini','gemini_budget','kimi','glm','ollama'].includes(effective)) {
      fields.push(providerEditorField('Thinking type', 'thinking_type', { choices: [['enabled','사용'],['disabled','사용 안 함']] }));
    }
    fields.push(guiEl('div', { class: 'sga-actions' }, [
      quickButton('추론 끔', { reasoning_preset: 'off', reasoning_effort: 'none', reasoning_budget_tokens: 0, thinking_type: 'disabled', glm_thinking_type: 'disabled' }),
      quickButton('자동', { reasoning_preset: 'auto', thinking_type: 'enabled', glm_thinking_type: 'enabled' }),
      quickButton('Low', { reasoning_effort: 'low', thinking_type: 'enabled', glm_thinking_type: 'enabled' }),
      quickButton('Medium', { reasoning_effort: 'medium', thinking_type: 'enabled', glm_thinking_type: 'enabled' }),
      quickButton('High', { reasoning_effort: 'high', thinking_type: 'enabled', glm_thinking_type: 'enabled' })
    ]));
    return providerPanel('LIBRA 6.1 추론 프리셋', '프로바이더별 추론 Body와 출력 토큰 상한을 LIBRA 6.1 방식으로 구성합니다.', fields, 'reasoning');
  };


  const buildProvidersTab = () => {
    let names = presetNamesFromState();
    if (!Gui.state.providers[Gui.selectedPreset]) Gui.selectedPreset = names[0];
    const preset = Gui.state.providers[Gui.selectedPreset];
    const provider = canonicalProvider(preset.provider);
    const vertex = isVertexProvider(provider);
    const filter = text(Gui.providerFilter || '').trim().toLowerCase();
    const visibleNames = filter ? names.filter(name => name.toLowerCase().includes(filter) || text(Gui.state.providers[name]?.model || '').toLowerCase().includes(filter) || text(Gui.state.providers[name]?.provider || '').toLowerCase().includes(filter)) : names;
    const list = guiEl('div', { class: 'sga-list' }, [
      guiEl('div', { class: 'sga-list-head' }, [
        guiEl('button', { class: 'sga-btn primary', text: '추가', onClick: addGuiPreset }),
        guiEl('button', { class: 'sga-btn', text: '복제', onClick: () => {
          const name = uniquePresetName(`${Gui.selectedPreset} 복사본`);
          Gui.state.providers[name] = cloneJson(preset);
          Gui.selectedPreset = name;
          markGuiDirty();
          renderSettingsGui();
        } })
      ]),
      guiEl('input', { class: 'sga-list-search', type: 'search', placeholder: '프리셋 이름 · 모델 · 프로바이더 검색', value: Gui.providerFilter || '', onInput: event => { Gui.providerFilter = event.target.value; renderSettingsGui(); } }),
      guiEl('div', { class: 'sga-list-items' }, (visibleNames.length ? visibleNames : names).map(name => {
        const item = Gui.state.providers[name];
        return guiEl('button', { class: 'sga-list-item', dataset: { selected: String(name === Gui.selectedPreset) }, onClick: () => { Gui.selectedPreset = name; renderSettingsGui(); } }, [
          guiEl('strong', { text: name }),
          guiEl('span', { text: `${providerDisplayLabel(item.provider)} · ${item.model || '(모델 미설정)'}` })
        ]);
      }))
    ]);

    const secretStatus = preset.key ? '저장된 비밀 키가 있습니다.' : '비밀 키가 설정되지 않았습니다.';
    const secretField = inputNode('', next => { preset.key = next; preset.secret_deleted = false; }, { type: 'password', placeholder: preset.key ? '새 값을 입력하면 기존 키를 교체합니다' : 'API 키 / 토큰', autocomplete: 'new-password' });
    const connectionChildren = [
      guiEl('div', { class: 'sga-row2' }, [
        fieldNode('프리셋 이름', guiEl('div', { class: 'sga-actions' }, [
          inputNode(Gui.selectedPreset, () => {}, { placeholder: '프리셋 이름' }),
          guiEl('button', { class: 'sga-btn', text: '이름 변경', onClick: event => {
            try { renameGuiPreset(event.currentTarget.parentElement.querySelector('input').value); renderSettingsGui(); } catch (error) { guiSetStatus(error.message, true); }
          } })
        ])),
        providerEditorField('프로바이더 종류', 'provider', { choices: providerChoices() })
      ]),
      guiEl('div', { class: 'sga-row2' }, [
        providerEditorField('API 주소 / Base URL', 'url', { placeholder: defaultUrlForProvider(preset.provider), note: '전체 endpoint 또는 base URL을 입력할 수 있습니다.' }),
        providerEditorField('모델 이름', 'model', { placeholder: '프로바이더 모델 ID' })
      ])
    ];
    const modelMeta = providerModelMetadata(provider, preset.url);
    const modelCacheKey = `${provider}|${String(preset.url || '')}`;
    const fetchedModels = Array.isArray(Gui.providerModels[modelCacheKey]) ? Gui.providerModels[modelCacheKey] : [];
    if (modelMeta?.modelsUrl) {
      connectionChildren.push(fieldNode('프로바이더 모델 목록', guiEl('div', {}, [
        guiEl('div', { class: 'sga-actions' }, [
          guiEl('button', { class: 'sga-btn', text: Gui.providerModelLoading ? '불러오는 중…' : '모델 목록 불러오기', disabled: Gui.providerModelLoading, onClick: async () => {
            try {
              Gui.providerModelLoading = true;
              guiSetStatus(`${modelMeta.label} 모델 목록을 불러오는 중…`, false, true);
              const models = await listProviderModels(preset, { force: true });
              Gui.providerModels[modelCacheKey] = models;
              Gui.providerModelLoading = false;
              await renderSettingsGui();
              guiSetStatus(`${modelMeta.label} 모델 ${models.length}개를 불러왔습니다.`);
            } catch (error) {
              Gui.providerModelLoading = false;
              await renderSettingsGui();
              guiSetStatus(error.message || String(error), true, true);
            }
          } }),
          guiEl('span', { class: `sga-badge ${fetchedModels.length ? 'good' : 'off'}`, text: fetchedModels.length ? `${fetchedModels.length}개 로드됨` : '직접 입력 가능' })
        ]),
        fetchedModels.length ? selectNode(preset.model, [['','(현재 직접 입력 유지)'], ...fetchedModels.map(item => [item.id, item.label === item.id ? item.id : `${item.label} · ${item.id}`])], next => { if (next) { preset.model = next; markGuiDirty(); renderSettingsGui(); } }) : null
      ]), 'LIBRA 6.1 모델 카탈로그를 지원하는 프로바이더에서 최신 모델 ID를 조회합니다.'));
    }

    if (!vertex) connectionChildren.push(fieldNode('API 키 / 토큰', guiEl('div', {}, [secretField, guiEl('div', { class: 'sga-actions', style: { marginTop: '7px' } }, [
      guiEl('span', { class: `sga-badge ${preset.key ? 'good' : 'off'}`, text: secretStatus }),
      guiEl('button', { class: 'sga-btn danger', text: '저장된 키 삭제', onClick: () => { preset.key = ''; preset.secret_deleted = true; markGuiDirty(); renderSettingsGui(); } })
    ])]), '비밀값은 가능한 경우 기기 로컬 저장소에 보관합니다.'));

    const panels = [providerPanel('기본 연결', '프리셋 이름, 프로바이더, endpoint와 모델을 설정합니다.', connectionChildren, 'connection')];

    if (vertex) {
      const draft = Gui.vertexCredentialDrafts[Gui.selectedPreset] || '';
      const vertexArea = inputNode(draft, next => {
        Gui.vertexCredentialDrafts[Gui.selectedPreset] = next;
        const parsed = tryJsonParse(next, null);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          try {
            const applied = applyVertexCredentialsToPreset(preset, next, false);
            renderSettingsGui().then(() => guiSetStatus(`Vertex JSON 자동 적용 · ${applied.projectId || '프로젝트 ID는 URL에서 확인'} / ${applied.location || 'global'}`));
          } catch (_) {}
        }
      }, { tag: 'textarea', class: 'vertex-json', placeholder: '{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "...",\n  "client_email": "..."\n}\n\n또는 {"access_token":"...","project_id":"...","location":"global"}' });
      panels.push(providerPanel('Vertex 설정', 'Vertex 계열을 선택했을 때만 표시됩니다. 서비스 계정 JSON을 붙여넣으면 자격 증명과 URL을 즉시 채웁니다.', [
        vertexArea,
        guiEl('div', { class: 'sga-actions' }, [
          guiEl('button', { class: 'sga-btn primary', text: '붙여넣은 JSON 적용', onClick: () => {
            try {
              const applied = applyVertexCredentialsToPreset(preset, Gui.vertexCredentialDrafts[Gui.selectedPreset] || '', true);
              markGuiDirty();
              renderSettingsGui().then(() => guiSetStatus(`Vertex 자격 증명 적용 완료 · ${applied.projectId || '토큰 방식'} / ${applied.location || 'URL 유지'}`));
            } catch (error) { guiSetStatus(error.message, true, true); }
          } }),
          guiEl('button', { class: 'sga-btn', text: '기본 Vertex URL로 재생성', onClick: () => {
            try {
              const credential = preset.key || Gui.vertexCredentialDrafts[Gui.selectedPreset] || '';
              const parsed = tryJsonParse(credential, null);
              let applied;
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                applied = applyVertexCredentialsToPreset(preset, credential, false);
              } else {
                preset.url = defaultUrlForProvider(preset.provider);
                applied = applyVertexCredentialsToPreset(preset, credential, true);
              }
              markGuiDirty(); renderSettingsGui().then(() => guiSetStatus(`Vertex URL 재생성 · ${applied.projectId || 'PROJECT_ID 확인 필요'}`));
            } catch (error) { guiSetStatus(error.message, true, true); }
          } }),
          guiEl('span', { class: `sga-badge ${preset.key ? 'good' : 'warn'}`, text: preset.key ? '자격 증명 저장됨' : '자격 증명 필요' }),
          guiEl('button', { class: 'sga-btn danger', text: 'Vertex 자격 증명 삭제', onClick: () => { preset.key = ''; preset.secret_deleted = true; Gui.vertexCredentialDrafts[Gui.selectedPreset] = ''; markGuiDirty(); renderSettingsGui(); } })
        ]),
        guiEl('div', { class: 'sga-note', text: '붙여넣은 JSON의 project_id와 location/region 값을 이용해 Vertex Gemini 또는 Vertex OpenAI endpoint를 자동 구성합니다.' })
      ], 'vertex') );
    }

    panels.push(providerPanel('생성 설정', '일반 생성 파라미터와 스트리밍을 설정합니다.', [
      guiEl('div', { class: 'sga-row3' }, [
        providerEditorField('Temperature', 'temp', { number: true }),
        providerEditorField('최대 출력 토큰', 'max_tokens', { number: true }),
        providerEditorField('기본 타임아웃(ms)', 'timeout_ms', { number: true, note: '실행 흐름의 단계별 타임아웃이 있으면 그 값이 우선합니다.' })
      ]),
      guiEl('div', { class: 'sga-row2' }, [
        providerEditorField('요청 형식', 'request_format', { choices: providerSupportsResponses(provider) ? [['chat_completions','Chat Completions'],['responses','Responses API']] : [['chat_completions','Chat Completions (이 프로바이더의 지원 형식)']], note: providerSupportsResponses(provider) ? 'LIBRA 6.1 형식 라우팅을 사용합니다.' : '선택한 프로바이더는 Responses endpoint가 등록되지 않았습니다.' }),
        checkboxNode(!!preset.stream, '스트리밍 응답 사용', next => { preset.stream = next; })
      ])
    ], 'generation'));

    panels.push(buildReasoningPanel(preset));

    const flexChildren = [
      guiEl('div', { class: vertex ? 'sga-row2' : 'sga-row2' }, [
        providerEditorField('서비스 티어', 'service_tier', { choices: [['off','사용 안 함'],['auto','자동'],['default','default'],['flex','flex'],['priority','priority'],['scale','scale']] }),
        vertex
          ? providerEditorField('Vertex Flex 모드', 'vertex_flex_mode', { choices: [['off','사용 안 함'],['provisioned_then_flex','Provisioned → Flex'],['flex_only','Flex only']] })
          : guiEl('div', { class: 'sga-note sga-provider-note-box', text: 'Flex/priority/scale 지원 여부는 선택한 API와 모델 정책에 따릅니다.' })
      ])
    ];
    if (provider === 'custom') flexChildren.push(checkboxNode(!!preset.custom_service_tier_passthrough, 'Custom provider 요청 Body에 service_tier 전달', next => { preset.custom_service_tier_passthrough = next; }));
    panels.push(providerPanel('Flex 서비스', '일반 추론 옵션과 분리된 서비스 등급·Vertex Flex 전용 설정입니다.', flexChildren, 'flex'));

    panels.push(providerPanel('추가 요청 데이터', '필요한 경우에만 헤더와 Body JSON을 추가합니다.', [
      guiEl('div', { class: 'sga-row2' }, [
        providerEditorField('추가 HTTP 헤더 JSON', 'extra_headers_json', { textarea: true, placeholder: '{"HTTP-Referer":"..."}' }),
        providerEditorField('추가 요청 Body JSON', 'extra_body_json', { textarea: true, placeholder: '{"top_p":0.9}', note: 'messages·contents·system 등 핵심 필드는 덮어쓰지 않는 것을 권장합니다.' })
      ])
    ], 'extra'));

    const editor = guiEl('div', { class: 'sga-card sga-provider-editor' }, [
      guiEl('div', { class: 'sga-agent-head' }, [
        guiEl('div', {}, [guiEl('h2', { text: Gui.selectedPreset }), guiEl('div', { class: 'sga-note', text: '연결·추론·Flex 설정을 용도별로 나눠 표시합니다.' })]),
        guiEl('span', { class: `sga-badge ${providerConfigured(preset) ? 'good' : 'warn'}`, title: providerConfigurationIssues(preset).join(', '), text: providerConfigured(preset) ? '사용 가능' : `설정 필요: ${providerConfigurationIssues(preset).join(', ')}` })
      ]),
      guiEl('div', { class: 'sga-provider-panels' }, panels),
      guiEl('div', { class: 'sga-actions sga-provider-actions' }, [
        guiEl('button', { class: 'sga-btn good', text: '연결 테스트', onClick: async () => {
          try {
            guiSetStatus('연결을 테스트하고 있습니다…', false, true);
            const result = await testProviderPreset(preset);
            if (!result.ok) throw new Error(result.reason || '빈 응답');
            guiSetStatus(`연결 성공 · ${result.provider} / ${result.model} · ${result.elapsedMs}ms · ${compact(result.content, 100)}`);
          } catch (error) { guiSetStatus(`연결 실패: ${error.message || error}`, true, true); }
        } }),
        guiEl('button', { class: 'sga-btn danger', text: '프리셋 삭제', disabled: names.length <= 1, onClick: () => { try { deleteGuiPreset(); renderSettingsGui(); } catch (error) { guiSetStatus(error.message, true); } } })
      ])
    ]);

    return guiEl('div', {}, [
      guiEl('div', { class: 'sga-section-title' }, [guiEl('h2', { text: '프로바이더' }), guiEl('p', { text: 'LIBRA 6.1 직접 API 카탈로그와 Chat Completions/Responses 라우팅을 포함합니다.' })]),
      guiEl('div', { class: 'sga-split' }, [list, editor])
    ]);
  };

  const latestTraceForStage = (stageId, isPost = false) => {
    const traces = isPost ? Runtime.postTrace : Runtime.stageTrace;
    for (let i = (traces || []).length - 1; i >= 0; i -= 1) {
      if (traces[i]?.stage === stageId) return traces[i];
    }
    return null;
  };

  const resultText = (value, max = 1000) => {
    const body = text(value || '').replace(/\r\n/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim();
    if (!max || body.length <= max) return body;
    return body.slice(0, Math.max(0, max - 24)).trimEnd() + '\n...[truncated]';
  };

  const formatElapsedBrief = (ms) => {
    const n = Number(ms);
    if (!Number.isFinite(n) || n < 0) return '';
    if (n >= 1000) {
      const seconds = n / 1000;
      return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
    }
    return `${Math.round(n)}ms`;
  };

  const traceStateInfo = (trace, { enabled = true, isLiteSkip = false, isPost = false } = {}) => {
    if (isLiteSkip) return { label: '건너뜀', className: 'off', elapsed: '', title: '라이트 모드에서 이 단계는 실행되지 않습니다.' };
    if (!enabled) return { label: '꺼짐', className: 'off', elapsed: '', title: '이 단계가 비활성화되어 있습니다.' };
    if (!trace) {
      const running = isPost ? Runtime.postInFlight : Runtime.inFlight;
      return running
        ? { label: '실행 중', className: 'run', elapsed: '', title: '현재 단계 결과를 기다리는 중입니다.' }
        : { label: '실행 전', className: 'off', elapsed: '', title: '아직 이 단계의 실행 기록이 없습니다.' };
    }
    const elapsed = formatElapsedBrief(trace.elapsedMs);
    const reason = compact(trace.reason || trace.parsed?.reason || trace.fallbackStage?.reason || '', 300);
    if (trace.skipped || trace.parsed?.skipped) return { label: '건너뜀', className: 'off', elapsed, title: reason || '실행 조건에 의해 건너뛰었습니다.' };
    if (trace.ok && !trace.fallback && !trace.fallbackStage && !trace.parsed?.fallback) {
      return { label: isPost ? '완료' : '성공', className: 'good', elapsed, title: reason || '최근 실행이 성공했습니다.' };
    }
    if (trace.fallback || trace.fallbackStage || trace.parsed?.fallback) {
      return { label: '폴백', className: 'warn', elapsed, title: reason || '폴백 결과가 사용되었습니다.' };
    }
    return { label: '실패', className: 'danger', elapsed, title: reason || '최근 실행이 실패했습니다.' };
  };

  const traceBadgeNode = (info) => guiEl('span', { class: `sga-mini-badge ${info.className}`, title: info.title || '' }, [
    guiEl('span', { text: info.label }),
    info.elapsed ? guiEl('span', { class: 'sga-mini-time', text: info.elapsed }) : null
  ]);

  const resultLineNode = (label, value, options = {}) => {
    const max = Object.prototype.hasOwnProperty.call(options, 'max') ? options.max : 900;
    const body = resultText(value, max);
    if (!body) return null;
    return guiEl('div', { class: 'sga-result-row' }, [
      guiEl('span', { class: 'sga-result-label', text: label }),
      guiEl('div', { class: options.code ? 'sga-result-code' : 'sga-result-value', text: body })
    ]);
  };

  const resultListText = (items) => {
    if (!items) return '';
    if (!Array.isArray(items)) return typeof items === 'object' ? JSON.stringify(items, null, 2) : text(items);
    return items.map((item, index) => {
      if (item == null) return '';
      if (typeof item === 'string') return `- ${item}`;
      if (typeof item !== 'object') return `- ${text(item)}`;
      const body = [item.type || item.kind || `#${index + 1}`, item.reason || item.summary || item.evidence || '', item.change || item.fix || item.note || ''].filter(Boolean).join(' | ');
      return `- ${body}`;
    }).filter(Boolean).join('\n');
  };

  const resultFindingsText = (items) => {
    if (!Array.isArray(items)) return resultListText(items);
    return items.map((item, index) => {
      if (item == null) return '';
      if (typeof item !== 'object') return `- ${text(item)}`;
      const head = [item.severity, item.type || item.category || `finding_${index + 1}`].filter(Boolean).join(' / ');
      const detail = [item.evidence, item.fix || item.change].filter(Boolean).join(' -> ');
      return `- ${head}${detail ? `: ${detail}` : ''}`;
    }).filter(Boolean).join('\n');
  };

  const traceJsonForDisplay = (def, trace, parsed, isPost) => {
    const base = {
      stage: def.id,
      label: def.label,
      ok: trace.ok,
      reason: trace.reason || parsed?.reason || '',
      elapsedMs: trace.elapsedMs || 0,
      provider: trace.provider || '',
      presetName: trace.presetName || '',
      model: trace.model || ''
    };
    const values = parsed?.analysisOnly ? {
      summary: parsed.summary || parsed.analysis?.summary || '',
      constraints: parsed.constraints || parsed.analysis?.constraints || [],
      risks: parsed.risks || parsed.analysis?.risks || [],
      notes: parsed.notes || parsed.draft?.notes || [],
      handoff: parsed.handoff || ''
    } : isPost ? {
      findings: parsed?.findings || [],
      rewrite_required: !!parsed?.rewrite_required,
      revisedPreview: parsed?.revisedPreview || compact(parsed?.revised_response || '', 1200)
    } : {
      analysis: parsed?.analysis || {},
      edits: parsed?.edits || [],
      change_log: parsed?.change_log || [],
      draft: parsed?.draft || {},
      final_overlay: parsed?.final_overlay || null
    };
    return JSON.stringify({ status: base, values }, null, 2);
  };

  const buildStageResultPanel = (def, trace, options = {}) => {
    const isPost = !!options.isPost;
    const isAnalysisOnly = !!options.isAnalysisOnly;
    const statusInfo = traceStateInfo(trace, options);
    const parsed = trace?.parsed || trace?.fallbackStage || {};
    const providerLine = trace ? [trace.provider, trace.presetName, trace.model].filter(Boolean).join(' / ') : '';
    const rows = [];
    if (trace) {
      rows.push(resultLineNode('호출', providerLine || '(provider 기록 없음)', { max: 520 }));
      rows.push(resultLineNode('사유', trace.reason || parsed.reason || '', { max: 520 }));
      if (isAnalysisOnly || parsed.analysisOnly) {
        rows.push(resultLineNode('분석 요약', parsed.summary || parsed.analysis?.summary || '', { max: 900 }));
        rows.push(resultLineNode('제약 값', resultListText(parsed.constraints || parsed.analysis?.constraints), { max: 1200, code: true }));
        rows.push(resultLineNode('리스크 값', resultListText(parsed.risks || parsed.analysis?.risks), { max: 1200, code: true }));
        rows.push(resultLineNode('노트', resultListText(parsed.notes || parsed.draft?.notes), { max: 1200, code: true }));
        rows.push(resultLineNode('다음 작성 전달', parsed.handoff || '', { max: 1200, code: true }));
      } else if (isPost) {
        rows.push(resultLineNode('편집 판정', trace.ok ? (parsed.rewrite_required ? '편집 반영' : '원문 유지') : '실패/보존', { max: 260 }));
        rows.push(resultLineNode('개선 값', resultFindingsText(parsed.findings), { max: 1200, code: true }));
        rows.push(resultLineNode('결과 응답', parsed.revisedPreview || parsed.revised_response || '', { max: 1200, code: true }));
      } else {
        const analysis = parsed.analysis || {};
        const draftText = parsed.final_overlay?.final_rp_draft || parsed.draft?.rp_text || parsed.rp_text || '';
        rows.push(resultLineNode('분석 요약', analysis.summary || '', { max: 700 }));
        rows.push(resultLineNode('제약 값', resultListText(analysis.constraints), { max: 1100, code: true }));
        rows.push(resultLineNode('리스크 값', resultListText(analysis.risks), { max: 1100, code: true }));
        rows.push(resultLineNode('수정 로그', resultListText(parsed.change_log?.length ? parsed.change_log : parsed.edits), { max: 1100, code: true }));
        rows.push(resultLineNode('초안 결과', draftText, { max: 0, code: true }));
      }
    }
    return guiEl('aside', { class: 'sga-stage-result' }, [
      guiEl('div', { class: 'sga-stage-result-head' }, [
        guiEl('span', { class: 'sga-stage-result-title', text: '최근 결과' }),
        traceBadgeNode(statusInfo)
      ]),
      ...(trace ? rows : [guiEl('div', { class: 'sga-result-empty', text: statusInfo.className === 'run' ? '실행 중입니다. 결과가 기록되면 자동으로 갱신됩니다.' : '아직 이 단계의 실행 기록이 없습니다.' })]),
      trace ? guiEl('details', {}, [
        guiEl('summary', { text: '실제 값 JSON' }),
        guiEl('div', { class: 'sga-result-code', text: resultText(traceJsonForDisplay(def, trace, parsed, isPost), 0) })
      ]) : null
    ]);
  };

  const buildStageCard = (def, slotValue, index, kind, settings) => {
    const isBefore = kind === 'before';
    const slot = normalizeAgentSlot(slotValue, {
      enabled: true,
      maxChars: DEFAULT_STAGE_CONTEXT_CHARS,
      turnWindow: DEFAULT_RECENT_TURNS,
      timeoutMs: DEFAULT_STAGE_TIMEOUT_MS,
      executionMode: defaultExecutionModeForStage(def.id),
      risuRefs: defaultRisuReferencesForStage(def.id)
    }, def.id);
    Object.assign(slotValue, slot);
    if (!Gui.state.prompts || typeof Gui.state.prompts !== 'object') Gui.state.prompts = {};
    if (!Gui.state.prompts[def.id] || typeof Gui.state.prompts[def.id] !== 'object') Gui.state.prompts[def.id] = {};
    const prompt = Gui.state.prompts[def.id];
    Object.assign(prompt, normalizePromptEntry(prompt, { mode: 'builtin', customPrompt: '', extraPrompt: '' }));
    const isLiteSkip = isBefore && settings?.mode === 'lite' && (def.id === 'aide_character' || def.id === 'aide_world');
    const handoffLabel = !isBefore ? null
      : def.id === 'shadow_act' ? '첫 초안 작성 → 인물 AIDE에 전달'
      : def.id === 'aide_character' ? '인물 분석 후 재작성 → 세계관 AIDE에 전달'
      : def.id === 'aide_world' ? '세계관 분석 후 재작성 → 플롯 AIDE에 전달'
      : '플롯 분석 후 최종 재작성 → 메인 모델에 전달';
    const trace = latestTraceForStage(def.id, !isBefore);
    const traceOptions = { enabled: !!slot.enabled, isLiteSkip, isPost: !isBefore };
    const statusInfo = traceStateInfo(trace, traceOptions);
    const promptModeField = fieldNode('방향성 설정', selectNode(prompt.mode, [
      ['builtin','내장 방향만'],
      ['replace','방향성 지시 추가']
    ], next => {
      prompt.mode = normalizePromptMode(next, prompt.customPrompt || '');
      markGuiDirty();
      renderSettingsGui();
    }), prompt.mode === 'replace' ? '문체·뉘앙스·강조점만 추가합니다. 단계 역할과 재작성 구조는 내장 지시가 유지됩니다.' : '플러그인 내장 구조와 기본 작성 방향을 사용합니다.');

    const detailFields = [
      fieldNode('최대 글자', inputNode(slot.maxChars, next => { slotValue.maxChars = Number(next); }, { type: 'number', min: 1000, max: 100000 }), '기본 10000자. 이 단계에 전달되는 최근 대화·응답 범위를 제한합니다.'),
      fieldNode('최근 턴 범위', inputNode(slot.turnWindow, next => { slotValue.turnWindow = Number(next); }, { type: 'number', min: 1, max: 64 }), '이 단계가 참고할 최근 user/assistant 턴 범위입니다.'),
      fieldNode('타임아웃(ms)', inputNode(slot.timeoutMs, next => { slotValue.timeoutMs = Number(next); }, { type: 'number', min: 5000, max: 300000 }), `기본 ${DEFAULT_STAGE_TIMEOUT_MS}ms. 프로바이더 프리셋의 기본 타임아웃보다 우선합니다.`)
    ];
    if (isBefore) detailFields.push(fieldNode('모드', selectNode(slot.executionMode, [
      ['analysis_draft','세부 분석 / 초안 작성 분리'],
      ['draft_only','초안 작성 only']
    ], next => { slotValue.executionMode = next; }), '분리 모드는 분석 호출 후 초안 작성 호출을 수행합니다.'));

    const risuReferenceBlock = isBefore ? guiEl('div', { class: 'sga-reference-box' }, [
      guiEl('div', { class: 'sga-reference-head' }, [
        guiEl('strong', { text: 'RisuAI 참조' }),
        guiEl('span', { text: '단계별 선택 활성' })
      ]),
      guiEl('div', { class: 'sga-reference-grid' }, [
        checkboxNode(slot.risuRefs.persona, '페르소나', next => { slotValue.risuRefs.persona = next; }),
        checkboxNode(slot.risuRefs.characterDescription, '캐릭터 설명', next => { slotValue.risuRefs.characterDescription = next; }),
        checkboxNode(slot.risuRefs.characterLorebook, '캐릭터 로어북', next => { slotValue.risuRefs.characterLorebook = next; }),
        checkboxNode(slot.risuRefs.moduleLorebook, '모듈 로어북 (활성 모듈만)', next => { slotValue.risuRefs.moduleLorebook = next; })
      ]),
      guiEl('div', { class: 'sga-note', text: '캐릭터 로어북에는 현재 채팅에 연결된 캐릭터 로어가 포함될 수 있습니다. 모듈 로어북은 RisuAI에서 현재 활성화된 모듈만 후보로 불러온 뒤 최근 대화 키와 일치하는 항목을 참조합니다.' })
    ]) : null;

    const promptBody = prompt.mode === 'replace'
      ? fieldNode('방향성 지시', inputNode(prompt.customPrompt || '', next => { prompt.customPrompt = next; }, { tag: 'textarea', class: 'stage-prompt', placeholder: '문체, 뉘앙스, 감정 밀도, 대사 리듬, 장면 분위기 같은 창작 방향만 입력하세요.' }), '구조 대체가 아닙니다. 사용 가능 변수: {{stage}}, {{stage_label}}, {{recent_chat}}, {{latest_user}}, {{previous_draft}}, {{risu_context}}, {{original_response}}, {{current_response}}, {{json_contract}}')
      : guiEl('div', { class: 'sga-prompt-builtin' }, [
          isBefore ? fieldNode('내장 방향성 보강', inputNode(prompt.extraPrompt || '', next => { prompt.extraPrompt = next; }, { tag: 'textarea', placeholder: '선택 사항: 문체, 뉘앙스, 강조점 같은 방향성 보강' }), '내장 구조와 JSON/plain 출력 계약을 유지하면서 창작 방향만 보강합니다.') : null,
          guiEl('details', { class: 'sga-advanced' }, [
            guiEl('summary', {}, [guiEl('span', { text: '내장 프롬프트 미리보기' }), guiEl('span', { class: 'sga-advanced-hint', text: def.label })]),
            guiEl('div', { class: 'sga-advanced-body' }, [guiEl('textarea', { class: 'sga-textarea preview', value: builtInPromptPreview(def.id), readonly: true })])
          ])
        ]);

    return guiEl('div', { class: `sga-card sga-agent sga-agent-expanded${isLiteSkip || (!slot.enabled && def.id !== 'shadow_act') ? ' dim' : ''}` }, [
      guiEl('div', { class: 'sga-agent-head' }, [
        guiEl('div', { class: 'sga-agent-title' }, [guiEl('span', { class: 'sga-agent-index', text: String(index + 1) }), guiEl('div', {}, [guiEl('h3', { text: def.label }), guiEl('div', { class: 'sga-agent-desc compact', text: def.description })])]),
        guiEl('div', { class: 'sga-agent-run-meta' }, [
          traceBadgeNode(statusInfo),
          guiEl('span', { class: `sga-badge ${slot.enabled ? (isStageConfiguredInGui(def.id) ? 'good' : 'warn') : 'off'}`, text: isLiteSkip ? '라이트 건너뜀' : (slot.enabled ? (isStageConfiguredInGui(def.id) ? '사용' : '프리셋 확인') : '꺼짐') })
        ])
      ]),
      isBefore && handoffLabel ? guiEl('div', { class: 'sga-handoff', style: { padding: '0', margin: '0 0 2px' } }, [guiEl('span', { text: handoffLabel })]) : null,
      guiEl('div', { class: 'sga-stage-layout' }, [
        guiEl('div', { class: 'sga-stage-controls' }, [
          guiEl('div', { class: 'sga-stage-primary' }, [
            checkboxNode(slot.enabled, '이 단계 사용', next => { slotValue.enabled = next; renderSettingsGui(); }),
            fieldNode('사용할 프로바이더 프리셋', selectNode(slot.presetName || '', presetChoicesFromState(true), next => { slotValue.presetName = next; renderSettingsGui(); }), `실제 사용: ${resolvedPresetNameForStage(def.id)}`),
            promptModeField
          ]),
          promptBody,
          guiEl('div', { class: 'sga-stage-detail' }, [
            guiEl('div', { class: 'sga-stage-detail-head' }, [guiEl('strong', { text: '세부 설정' }), guiEl('span', { text: `${slot.maxChars}자 · ${slot.turnWindow}턴 · ${slot.timeoutMs}ms` })]),
            guiEl('div', { class: isBefore ? 'sga-row4' : 'sga-row3' }, detailFields),
            risuReferenceBlock
          ]),
          isBefore && def.id === 'shadow_act' ? guiEl('div', { class: 'sga-note', text: 'SHADOW ACT가 꺼지면 응답 전 파이프라인 전체가 실행되지 않습니다.' }) : null
        ]),
        buildStageResultPanel(def, trace, traceOptions)
      ])
    ]);
  };

  const newGuiCustomAnalysisAgent = () => {
    const list = Gui.state?.agents?.customAnalysisAgents || [];
    return normalizeGuiCustomAnalysisAgent({
      id: `${CUSTOM_ANALYSIS_STAGE_PREFIX}${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      label: `분석 에이전트 ${list.length + 1}`,
      insert_after: 'shadow_act',
      preset: '',
      prompt: [
        '현재 초안이 최신 유저 입력에 정확히 반응하는지 분석하세요.',
        '다음 작성 에이전트가 보강해야 할 문체, 감정선, 정보 배치, 금지 전개를 정리하세요.',
        '초안을 직접 쓰거나 재작성하지 말고 분석만 반환하세요.'
      ].join('\n')
    }, list.length);
  };

  const addGuiCustomAnalysisAgent = () => {
    if (!Gui.state.agents.customAnalysisAgents) Gui.state.agents.customAnalysisAgents = [];
    Gui.state.agents.customAnalysisAgents.push(newGuiCustomAnalysisAgent());
    markGuiDirty();
    renderSettingsGui();
  };

  const removeGuiCustomAnalysisAgent = (index) => {
    const list = Gui.state.agents.customAnalysisAgents || [];
    list.splice(index, 1);
    markGuiDirty();
    renderSettingsGui();
  };

  const moveGuiCustomAnalysisAgent = (index, direction) => {
    const list = Gui.state.agents.customAnalysisAgents || [];
    const next = index + direction;
    if (next < 0 || next >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(next, 0, item);
    markGuiDirty();
    renderSettingsGui();
  };

  const buildCustomAnalysisCard = (agentValue, index) => {
    const agent = normalizeGuiCustomAnalysisAgent(agentValue, index);
    Object.assign(agentValue, agent);
    const def = customAnalysisDef({
      id: agent.id,
      label: agent.label
    }, index);
    const trace = latestTraceForStage(agent.id, false);
    const traceOptions = { enabled: !!agent.enabled, isAnalysisOnly: true };
    const statusInfo = traceStateInfo(trace, traceOptions);
    const refs = agent.risuRefs || (agent.risuRefs = normalizeRisuReferences({}, {}));
    const insertChoices = CUSTOM_ANALYSIS_INSERT_POINTS.map(item => [item.value, item.label]);
    const detailFields = [
      fieldNode('최대 글자', inputNode(agent.maxChars, next => { agentValue.maxChars = Number(next); }, { type: 'number', min: 1000, max: 100000 }), '이 분석 에이전트에 전달되는 최근 대화·초안 범위입니다.'),
      fieldNode('최근 턴 범위', inputNode(agent.turnWindow, next => { agentValue.turnWindow = Number(next); }, { type: 'number', min: 1, max: 64 }), '분석 근거로 볼 최근 user/assistant 턴 범위입니다.'),
      fieldNode('타임아웃(ms)', inputNode(agent.timeoutMs, next => { agentValue.timeoutMs = Number(next); }, { type: 'number', min: 5000, max: 300000 }), `기본 ${DEFAULT_STAGE_TIMEOUT_MS}ms. 프로바이더 프리셋보다 우선합니다.`)
    ];
    const risuReferenceBlock = guiEl('div', { class: 'sga-reference-box' }, [
      guiEl('div', { class: 'sga-reference-head' }, [
        guiEl('strong', { text: 'RisuAI 참조' }),
        guiEl('span', { text: '분석 근거로만 사용' })
      ]),
      guiEl('div', { class: 'sga-reference-grid' }, [
        checkboxNode(refs.persona, '페르소나', next => { agentValue.risuRefs.persona = next; }),
        checkboxNode(refs.characterDescription, '캐릭터 설명', next => { agentValue.risuRefs.characterDescription = next; }),
        checkboxNode(refs.characterLorebook, '캐릭터 로어북', next => { agentValue.risuRefs.characterLorebook = next; }),
        checkboxNode(refs.moduleLorebook, '모듈 로어북 (활성 모듈만)', next => { agentValue.risuRefs.moduleLorebook = next; })
      ])
    ]);
    return guiEl('div', { class: 'sga-card sga-agent sga-agent-expanded sga-analysis-agent' }, [
      guiEl('div', { class: 'sga-agent-head' }, [
        guiEl('div', { class: 'sga-agent-title' }, [
          guiEl('span', { class: 'sga-agent-index', text: `A${index + 1}` }),
          guiEl('div', {}, [
            guiEl('h3', { text: agent.label || `분석 에이전트 ${index + 1}` }),
            guiEl('div', { class: 'sga-agent-desc compact', text: '초안을 수정하지 않고 분석만 수행한 뒤 다음 작성 에이전트에 전달합니다.' })
          ])
        ]),
        guiEl('div', { class: 'sga-agent-run-meta' }, [
          traceBadgeNode(statusInfo),
          guiEl('span', { class: `sga-badge ${agent.enabled ? (isStageConfiguredInGui(agent.id) ? 'good' : 'warn') : 'off'}`, text: agent.enabled ? (isStageConfiguredInGui(agent.id) ? '분석 사용' : '프리셋 확인') : '꺼짐' })
        ])
      ]),
      guiEl('div', { class: 'sga-stage-layout' }, [
        guiEl('div', { class: 'sga-stage-controls' }, [
          guiEl('div', { class: 'sga-stage-primary' }, [
            checkboxNode(agent.enabled, '이 분석 사용', next => { agentValue.enabled = next; renderSettingsGui(); }),
            fieldNode('삽입 위치', selectNode(agent.insertAfter, insertChoices, next => { agentValue.insertAfter = normalizeCustomAnalysisInsertAfter(next); renderSettingsGui(); }), '선택한 작성 에이전트 직후, 다음 작성 에이전트 직전에 실행됩니다.'),
            fieldNode('사용할 프로바이더 프리셋', selectNode(agent.presetName || '', presetChoicesFromState(true), next => { agentValue.presetName = next; renderSettingsGui(); }), `실제 사용: ${resolvedPresetNameForStage(agent.id)}`)
          ]),
          guiEl('div', { class: 'sga-row2' }, [
            fieldNode('표시 이름', inputNode(agent.label, next => { agentValue.label = compact(next, 80); }), '디버그와 결과 패널에 표시됩니다.'),
            fieldNode('고정 ID', guiEl('input', { class: 'sga-input', value: agent.id, readonly: true }), '저장 및 추적용 ID입니다. 새로 만들 때 자동 생성됩니다.')
          ]),
          fieldNode('분석 지시', inputNode(agent.prompt || '', next => { agentValue.prompt = next; }, { tag: 'textarea', class: 'stage-prompt', placeholder: '예: 현재 초안의 감정선, 대사 자연스러움, 장면 잠금, 금지 전개를 분석하세요. 초안은 쓰지 마세요.' }), '사용 가능 변수: {{recent_chat}}, {{latest_user}}, {{previous_draft}}, {{risu_context}}, {{accumulated_analysis}}'),
          guiEl('div', { class: 'sga-stage-detail' }, [
            guiEl('div', { class: 'sga-stage-detail-head' }, [guiEl('strong', { text: '세부 설정' }), guiEl('span', { text: `${agent.maxChars}자 · ${agent.turnWindow}턴 · ${agent.timeoutMs}ms` })]),
            guiEl('div', { class: 'sga-row3' }, detailFields),
            risuReferenceBlock
          ]),
          guiEl('div', { class: 'sga-actions' }, [
            guiEl('button', { class: 'sga-btn', text: '위로', disabled: index <= 0, onClick: () => moveGuiCustomAnalysisAgent(index, -1) }),
            guiEl('button', { class: 'sga-btn', text: '아래로', disabled: index >= (Gui.state.agents.customAnalysisAgents || []).length - 1, onClick: () => moveGuiCustomAnalysisAgent(index, 1) }),
            guiEl('button', { class: 'sga-btn danger', text: '삭제', onClick: () => removeGuiCustomAnalysisAgent(index) })
          ])
        ]),
        buildStageResultPanel(def, trace, traceOptions)
      ])
    ]);
  };

  const newGuiCustomPostAgent = () => {
    const list = Gui.state?.posts?.customPostAgents || [];
    return normalizeGuiCustomPostAgent({
      id: `${CUSTOM_POST_STAGE_PREFIX}${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      label: `후속 편집 에이전트 ${list.length + 1}`,
      preset: '',
      prompt: [
        'RisuAI가 반환한 현재 응답을 같은 장면과 같은 턴 안에서 더 좋은 최종본으로 다듬으세요.',
        '문체, 대사 자연스러움, 감정선, 장면 밀도, 캐릭터 보이스를 보강하되 필수 템플릿과 유저 주도권은 유지하세요.',
        '응답을 요약하거나 짧게 줄이지 말고, 품질을 낮출 수정은 하지 마세요.'
      ].join('\n')
    }, list.length);
  };

  const addGuiCustomPostAgent = () => {
    if (!Gui.state.posts.customPostAgents) Gui.state.posts.customPostAgents = [];
    Gui.state.posts.customPostAgents.push(newGuiCustomPostAgent());
    markGuiDirty();
    renderSettingsGui();
  };

  const removeGuiCustomPostAgent = (index) => {
    const list = Gui.state.posts.customPostAgents || [];
    list.splice(index, 1);
    markGuiDirty();
    renderSettingsGui();
  };

  const moveGuiCustomPostAgent = (index, direction) => {
    const list = Gui.state.posts.customPostAgents || [];
    const next = index + direction;
    if (next < 0 || next >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(next, 0, item);
    markGuiDirty();
    renderSettingsGui();
  };

  const buildCustomPostCard = (agentValue, index) => {
    const agent = normalizeGuiCustomPostAgent(agentValue, index);
    Object.assign(agentValue, agent);
    const def = customPostDef(agent, index);
    const trace = latestTraceForStage(agent.id, true);
    const traceOptions = { enabled: !!agent.enabled, isPost: true };
    const statusInfo = traceStateInfo(trace, traceOptions);
    const detailFields = [
      fieldNode('최대 글자', inputNode(agent.maxChars, next => { agentValue.maxChars = Number(next); }, { type: 'number', min: 1000, max: 100000 }), '이 편집 에이전트에 전달되는 최근 대화·응답 범위입니다.'),
      fieldNode('최근 턴 범위', inputNode(agent.turnWindow, next => { agentValue.turnWindow = Number(next); }, { type: 'number', min: 1, max: 64 }), '편집 근거로 볼 최근 user/assistant 턴 범위입니다.'),
      fieldNode('타임아웃(ms)', inputNode(agent.timeoutMs, next => { agentValue.timeoutMs = Number(next); }, { type: 'number', min: 5000, max: 300000 }), `기본 ${DEFAULT_STAGE_TIMEOUT_MS}ms. 프로바이더 프리셋보다 우선합니다.`)
    ];
    return guiEl('div', { class: 'sga-card sga-agent sga-agent-expanded' }, [
      guiEl('div', { class: 'sga-agent-head' }, [
        guiEl('div', { class: 'sga-agent-title' }, [
          guiEl('span', { class: 'sga-agent-index', text: `P${index + 1}` }),
          guiEl('div', {}, [
            guiEl('h3', { text: agent.label || `후속 편집 에이전트 ${index + 1}` }),
            guiEl('div', { class: 'sga-agent-desc compact', text: 'RisuAI가 반환한 응답을 수정·확장해 더 좋은 최종 응답으로 만듭니다.' })
          ])
        ]),
        guiEl('div', { class: 'sga-agent-run-meta' }, [
          traceBadgeNode(statusInfo),
          guiEl('span', { class: `sga-badge ${agent.enabled ? (isStageConfiguredInGui(agent.id) ? 'good' : 'warn') : 'off'}`, text: agent.enabled ? (isStageConfiguredInGui(agent.id) ? '편집 사용' : '프리셋 확인') : '꺼짐' })
        ])
      ]),
      guiEl('div', { class: 'sga-stage-layout' }, [
        guiEl('div', { class: 'sga-stage-controls' }, [
          guiEl('div', { class: 'sga-stage-primary' }, [
            checkboxNode(agent.enabled, '이 편집 사용', next => { agentValue.enabled = next; renderSettingsGui(); }),
            fieldNode('사용할 프로바이더 프리셋', selectNode(agent.presetName || '', presetChoicesFromState(true), next => { agentValue.presetName = next; renderSettingsGui(); }), `실제 사용: ${resolvedPresetNameForStage(agent.id)}`),
            fieldNode('고정 ID', guiEl('input', { class: 'sga-input', value: agent.id, readonly: true }), '저장 및 추적용 ID입니다.')
          ]),
          fieldNode('표시 이름', inputNode(agent.label, next => { agentValue.label = compact(next, 80); }), '디버그와 결과 패널에 표시됩니다.'),
          fieldNode('편집 지시', inputNode(agent.prompt || '', next => { agentValue.prompt = next; }, { tag: 'textarea', class: 'stage-prompt', placeholder: '예: 대사를 더 자연스럽게, 장면 밀도를 높이고, 템플릿/이미지 커맨드는 유지하세요.' }), '사용 가능 변수: {{recent_chat}}, {{latest_user}}, {{latest_assistant}}, {{original_response}}, {{current_response}}, {{response}}, {{json_contract}}'),
          guiEl('div', { class: 'sga-stage-detail' }, [
            guiEl('div', { class: 'sga-stage-detail-head' }, [guiEl('strong', { text: '세부 설정' }), guiEl('span', { text: `${agent.maxChars}자 · ${agent.turnWindow}턴 · ${agent.timeoutMs}ms` })]),
            guiEl('div', { class: 'sga-row3' }, detailFields)
          ]),
          guiEl('div', { class: 'sga-actions' }, [
            guiEl('button', { class: 'sga-btn', text: '위로', disabled: index <= 0, onClick: () => moveGuiCustomPostAgent(index, -1) }),
            guiEl('button', { class: 'sga-btn', text: '아래로', disabled: index >= (Gui.state.posts.customPostAgents || []).length - 1, onClick: () => moveGuiCustomPostAgent(index, 1) }),
            guiEl('button', { class: 'sga-btn danger', text: '삭제', onClick: () => removeGuiCustomPostAgent(index) })
          ])
        ]),
        buildStageResultPanel(def, trace, traceOptions)
      ])
    ]);
  };

  const buildAgentsTab = () => {
    const settings = Gui.state.runtime;
    const cards = [];
    const customAgents = Gui.state.agents.customAnalysisAgents || [];
    BEFORE_STAGE_DEFS.forEach((def, index) => {
      cards.push(buildStageCard(def, Gui.state.agents[def.id], index, 'before', settings));
      customAgents.forEach((agent, agentIndex) => {
        if (agent.insertAfter !== def.id) return;
        cards.push(guiEl('div', { class: 'sga-handoff sga-flow-handoff', style: { padding: '7px 18px' } }, [guiEl('span', { text: '↓ 분석 전용 에이전트 실행 / 초안은 유지' })]));
        cards.push(buildCustomAnalysisCard(agent, agentIndex));
      });
      if (index < BEFORE_STAGE_DEFS.length - 1) cards.push(guiEl('div', { class: 'sga-handoff sga-flow-handoff', style: { padding: '7px 18px' } }, [guiEl('span', { text: '↓ 이전 초안 + 누적 분석 전달' })]));
    });
    return guiEl('section', { class: 'sga-flow-section', id: 'sga-flow-before' }, [
      guiEl('div', { class: 'sga-section-title' }, [guiEl('h2', { text: '응답 전 에이전트' }), guiEl('p', { text: '작성 에이전트 사이에 분석 전용 에이전트를 원하는 만큼 추가하고, 분석 결과를 다음 작성 단계에 누적 전달합니다.' })]),
      guiEl('div', { class: 'sga-actions', style: { marginBottom: '14px' } }, [
        guiEl('button', { class: 'sga-btn primary', text: '분석 에이전트 추가', onClick: addGuiCustomAnalysisAgent }),
        guiEl('span', { class: 'sga-note', text: `${customAgents.length}개 추가됨` })
      ]),
      settings.mode === 'lite' ? guiEl('div', { class: 'sga-callout', text: '현재 작동 모드는 라이트입니다. 인물 AIDE와 세계관 AIDE는 켜져 있어도 건너뜁니다.', style: { marginBottom: '14px' } }) : null,
      guiEl('div', { class: 'sga-stack' }, cards)
    ]);
  };

  const buildPostTab = () => {
    const cards = [];
    const customPostAgents = Gui.state.posts.customPostAgents || [];
    customPostAgents.forEach((agent, index) => {
      cards.push(buildCustomPostCard(agent, index));
      if (index < customPostAgents.length - 1) cards.push(guiEl('div', { class: 'sga-handoff sga-flow-handoff', style: { padding: '7px 18px' } }, [guiEl('span', { text: '↓ 개선된 응답을 다음 후속 편집에 전달' })]));
    });
    return guiEl('section', { class: 'sga-flow-section', id: 'sga-flow-post' }, [
      guiEl('div', { class: 'sga-section-title' }, [guiEl('h2', { text: '응답 후 커스텀 편집' }), guiEl('p', { text: 'RisuAI가 반환한 응답을 사용자가 추가한 편집 에이전트들이 순서대로 수정·확장합니다.' })]),
      guiEl('div', { class: 'sga-card wide', style: { marginBottom: '14px' } }, [
        fieldNode('전체 후속 처리 모드', selectNode(Gui.state.runtime.afterProcessMode, [['off','끄기'],['audit','편집안만 확인하고 원문 반환'],['rewrite','각 편집본을 다음 단계에 전달 후 최종 반환']], next => { Gui.state.runtime.afterProcessMode = next; renderSettingsGui(); }), 'audit 모드에서도 모델 호출은 수행하지만 사용자에게는 원래 응답을 반환합니다.'),
        Gui.state.runtime.afterProcessMode === 'off' ? guiEl('div', { class: 'sga-callout', text: '전체 후속 처리가 꺼져 있어 아래 편집 에이전트는 실행되지 않습니다.' }) : null,
        guiEl('div', { class: 'sga-actions', style: { marginTop: '12px' } }, [
          guiEl('button', { class: 'sga-btn primary', text: '후속 편집 에이전트 추가', onClick: addGuiCustomPostAgent }),
          guiEl('span', { class: 'sga-note', text: `${customPostAgents.length}개 추가됨` })
        ])
      ]),
      cards.length ? guiEl('div', { class: 'sga-stack' }, cards) : guiEl('div', { class: 'sga-callout', text: '아직 후속 편집 에이전트가 없습니다. RisuAI 응답을 더 다듬고 싶을 때 원하는 만큼 추가하세요.' })
    ]);
  };

  const builtInPromptPreview = stageId => {
    if (BEFORE_STAGE_DEFS.some(def => def.id === stageId)) {
      return builtInStagePrompt(stageId, { text: '{{recent_chat}}', latestUser: '{{latest_user}}' }, null, settingsForGuiPreview()).system;
    }
    return builtInPostPrompt(stageId, null);
  };

  const buildPromptsTab = () => {
    const stageId = Gui.selectedPrompt;
    const def = STAGE_DEF_MAP[stageId] || BEFORE_STAGE_DEFS[0];
    if (!Gui.state.prompts || typeof Gui.state.prompts !== 'object') Gui.state.prompts = {};
    if (!Gui.state.prompts[stageId] || typeof Gui.state.prompts[stageId] !== 'object') Gui.state.prompts[stageId] = {};
    const entry = Gui.state.prompts[stageId];
    Object.assign(entry, normalizePromptEntry(entry, { mode: 'builtin', customPrompt: '', extraPrompt: '' }));
    const isBefore = BEFORE_STAGE_DEFS.some(item => item.id === stageId);
    const stageItems = [
      ...BEFORE_STAGE_DEFS.map(item => [item.id, `응답 전 · ${item.label}`]),
      ...POST_STAGE_DEFS.map(item => [item.id, `응답 후 · ${item.label}`])
    ];
    const customArea = inputNode(entry.customPrompt || '', next => { entry.customPrompt = next; }, { tag: 'textarea', class: 'tall', placeholder: '문체, 뉘앙스, 감정 밀도, 대사 리듬, 장면 분위기 같은 방향성만 입력하세요.' });
    return guiEl('div', {}, [
      guiEl('div', { class: 'sga-section-title' }, [guiEl('h2', { text: '방향성 관리' }), guiEl('p', { text: '각 단계의 내장 구조를 유지한 채 문체, 뉘앙스, 강조점 같은 창작 방향만 보강합니다.' })]),
      guiEl('div', { class: 'sga-card wide', style: { marginBottom: '14px' } }, [
        guiEl('div', { class: 'sga-row2' }, [
          fieldNode('편집할 단계', selectNode(stageId, stageItems, next => { Gui.selectedPrompt = next; renderSettingsGui(); })),
          fieldNode('방향성 모드', selectNode(entry.mode, [['builtin','내장 방향만 사용'],['replace','방향성 지시 추가']], next => {
            entry.mode = normalizePromptMode(next, entry.customPrompt || '');
            markGuiDirty();
            renderSettingsGui();
          }))
        ]),
        guiEl('div', { class: 'sga-callout good', text: entry.mode === 'replace' ? `${def.label}: 내장 구조는 유지되고 아래 방향성 지시만 창작 지침에 추가됩니다.` : `${def.label}: 플러그인 내장 구조와 기본 작성 방향만 사용합니다.` })
      ]),
      guiEl('div', { class: 'sga-grid' }, [
        guiEl('div', { class: 'sga-card' }, [
          guiEl('h3', { text: '내장 프롬프트 미리보기' }),
          guiEl('textarea', { class: 'sga-textarea preview', value: builtInPromptPreview(stageId), readonly: true }),
          isBefore ? fieldNode('내장 방향성 보강', inputNode(entry.extraPrompt || '', next => { entry.extraPrompt = next; }, { tag: 'textarea', placeholder: '내장 구조는 유지하고 문체·뉘앙스·강조점만 보강합니다.' }), '기본 단계 역할, same-turn 재작성 잠금, JSON/plain 출력 계약은 유지됩니다.') : null
        ]),
        guiEl('div', { class: 'sga-card' }, [
          guiEl('h3', { text: '방향성 지시' }),
          customArea,
          guiEl('div', { class: 'sga-note', text: '구조 대체가 아닙니다. 사용 가능한 변수: {{stage}}, {{stage_label}}, {{recent_chat}}, {{latest_user}}, {{latest_assistant}}, {{previous_stage_json}}, {{previous_draft}}, {{json_contract}}, {{original_response}}, {{current_response}}, {{response}}' }),
          guiEl('div', { class: 'sga-actions', style: { marginTop: '10px' } }, [
            guiEl('button', { class: 'sga-btn', text: '방향성 지시 비우기', onClick: () => { entry.mode = 'builtin'; entry.customPrompt = ''; markGuiDirty(); renderSettingsGui(); } }),
            guiEl('button', { class: 'sga-btn', text: '방향성 예시 넣기', onClick: () => { entry.customPrompt = '문체: 대사를 조금 더 자연스럽고 생활감 있게.\n뉘앙스: 과장된 감상보다 미묘한 반응과 작은 행동 중심.\n전개 방향: 같은 장면 안에서 밀도를 높이고 다음 장면으로 넘기지 않기.'; entry.mode = 'replace'; markGuiDirty(); renderSettingsGui(); } })
          ])
        ])
      ])
    ]);
  };

  const backendHostingSummary = (hosting = {}) => {
    const cfg = normalizeBackendHostingConfig(hosting);
    if (cfg.mode === 'off') return '브릿지 꺼짐';
    if (!cfg.url || !cfg.token) return 'Backend URL과 Token이 필요합니다';
    return `${cfg.autoDetected ? '자동 감지' : '수동 입력'} · ${cfg.url}${cfg.lastDetectedAt ? ` · ${cfg.lastDetectedAt}` : ''}`;
  };

  const fetchBackendBridge = async (url, init = {}, timeoutMs = 8000) => {
    const requestInit = { ...init, backendBridge: false };
    delete requestInit.cache;
    return await RisuCompat.nativeFetch(url, requestInit, Math.max(1000, timeoutMs));
  };

  const readBackendBridgeJson = async (response) => {
    try { return await response.json(); } catch (_) {
      const body = await response.text().catch(() => '');
      return tryJsonParse(body, { ok: false, error: body || `HTTP ${response?.status || '?'}` });
    }
  };

  const setGuiBackendHosting = (hosting) => {
    Gui.state.runtime.backendHosting = normalizeBackendHostingConfig(hosting);
    markGuiDirty();
    return Gui.state.runtime.backendHosting;
  };

  const detectBackendBridgeFromGui = async () => {
    guiSetStatus('LIBRA Hosting Bridge 로컬 bootstrap 감지 중…', false, true);
    try {
      const response = await fetchBackendBridge(LIBRA_HOSTING_BRIDGE_LOCAL_BOOTSTRAP_URL, {
        method: 'GET',
        headers: { 'x-libra-bootstrap-probe': '1' }
      }, 7000);
      const data = await readBackendBridgeJson(response);
      if (!response.ok || data?.ok === false || data?.schema !== 'libra.hosting_backend.v1') {
        throw new Error(data?.error || `bootstrap HTTP ${response.status || '?'}`);
      }
      const hosting = setGuiBackendHosting({
        mode: 'hosted',
        url: data.backendUrl || data.publicUrl || data.localUrl || '',
        token: data.backendToken || '',
        autoDetected: true,
        lastDetectedAt: new Date().toISOString(),
        lastManifest: data.manifest || null
      });
      if (!hosting.url || !hosting.token) throw new Error('bootstrap 응답에 backendUrl 또는 backendToken이 없습니다.');
      await renderSettingsGui();
      guiSetStatus(`Hosting Bridge 감지 완료 · ${hosting.url}`, false, true);
    } catch (error) {
      guiSetStatus(`Hosting Bridge 감지 실패: ${error.message || error}`, true, true);
    }
  };

  const testBackendBridgeFromGui = async () => {
    const hosting = setGuiBackendHosting(Gui.state.runtime.backendHosting || {});
    if (hosting.mode === 'off') {
      guiSetStatus('Hosting Bridge 모드가 꺼져 있습니다.', true, true);
      return;
    }
    if (!hosting.url || !hosting.token) {
      guiSetStatus('Backend URL과 Token을 입력하거나 자동 감지를 먼저 실행하세요.', true, true);
      return;
    }
    guiSetStatus('Hosting Bridge 연결 테스트 중…', false, true);
    try {
      const manifestResponse = await fetchBackendBridge(`${hosting.url}/__libra_host__/manifest`, { method: 'GET' }, 8000);
      const manifest = await readBackendBridgeJson(manifestResponse);
      if (!manifestResponse.ok || manifest?.schema !== 'libra.hosting_backend.v1') {
        throw new Error(manifest?.error || `manifest HTTP ${manifestResponse.status || '?'}`);
      }
      const tokenResponse = await fetchBackendBridge(`${hosting.url}/__libra_host__/fetch`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-libra-backend-token': hosting.token
        },
        body: '{}'
      }, 8000);
      const tokenPayload = await readBackendBridgeJson(tokenResponse);
      if (tokenResponse.status === 401) throw new Error(tokenPayload?.error || 'backend token rejected');
      setGuiBackendHosting({ ...hosting, lastManifest: manifest });
      await renderSettingsGui();
      guiSetStatus(`Hosting Bridge 연결 OK · ${manifest.version || 'unknown'} · ${manifest.tunnel?.ready ? 'tunnel ready' : manifest.tunnel?.mode || 'local'}`, false, true);
    } catch (error) {
      guiSetStatus(`Hosting Bridge 연결 실패: ${error.message || error}`, true, true);
    }
  };

  const buildBackendHostingPanel = () => {
    const hosting = normalizeBackendHostingConfig(Gui.state.runtime.backendHosting || {});
    Gui.state.runtime.backendHosting = hosting;
    const update = (patch) => {
      Gui.state.runtime.backendHosting = normalizeBackendHostingConfig({ ...Gui.state.runtime.backendHosting, ...patch });
      markGuiDirty();
    };
    return guiEl('div', { class: 'sga-card wide' }, [
      guiEl('h3', { text: 'LIBRA Hosting Bridge / 프록시' }),
      guiEl('div', { class: 'sga-note', text: 'provider 요청만 LIBRA 백엔드의 /__libra_host__/fetch로 우회합니다. RisuAI 본체 fetch나 GUI 동작은 건드리지 않습니다.' }),
      guiEl('div', { class: 'sga-row3', style: { marginTop: '10px' } }, [
        fieldNode('브릿지 모드', selectNode(hosting.mode, [['off','끄기'],['auto','자동'],['hosted','백엔드 사용']], next => update({ mode: next })), backendHostingSummary(hosting)),
        fieldNode('Backend URL', inputNode(hosting.url, next => update({ url: next, autoDetected: false }), { placeholder: 'https://xxxx.trycloudflare.com 또는 http://127.0.0.1:18787' }), '자동 감지는 로컬 bootstrap에서 public/local URL을 채웁니다.'),
        fieldNode('Backend Token', inputNode(hosting.token, next => update({ token: next, autoDetected: false }), { type: 'password', placeholder: 'x-libra-backend-token' }), hosting.token ? '토큰 입력됨' : '백엔드 토큰이 필요합니다.')
      ]),
      guiEl('div', { class: 'sga-actions', style: { marginTop: '10px' } }, [
        guiEl('button', { class: 'sga-btn good', text: '로컬 백엔드 자동 감지', onClick: detectBackendBridgeFromGui }),
        guiEl('button', { class: 'sga-btn', text: '브릿지 연결 테스트', onClick: testBackendBridgeFromGui }),
        guiEl('button', { class: 'sga-btn danger', text: '브릿지 설정 비우기', onClick: async () => {
          setGuiBackendHosting({ mode: 'off', url: '', token: '', autoDetected: false, lastDetectedAt: '', lastManifest: null });
          await renderSettingsGui();
          guiSetStatus('Hosting Bridge 설정을 비웠습니다.');
        } })
      ]),
      hosting.lastManifest ? guiEl('details', { class: 'sga-advanced', style: { marginTop: '10px' } }, [
        guiEl('summary', { text: '마지막 manifest' }),
        guiEl('div', { class: 'sga-code', text: JSON.stringify(hosting.lastManifest, null, 2) })
      ]) : null
    ]);
  };

  const runtimeField = (label, key, options = {}) => {
    const runtime = Gui.state.runtime;
    let control;
    if (options.choices) control = selectNode(runtime[key], options.choices, next => { runtime[key] = next; if (key === 'defaultPresetName') renderSettingsGui(); });
    else if (options.checkbox) control = checkboxNode(!!runtime[key], options.checkboxLabel || '사용', next => { runtime[key] = next; });
    else control = inputNode(runtime[key], next => { runtime[key] = options.number ? Number(next) : next; }, { type: options.number ? 'number' : 'text', min: options.min, max: options.max });
    return fieldNode(label, control, options.note || '');
  };

  const buildRuntimeTab = () => guiEl('section', { class: 'sga-flow-section', id: 'sga-flow-runtime' }, [
    guiEl('div', { class: 'sga-section-title' }, [
      guiEl('h2', { text: '런타임 / 주입 설정' }),
      guiEl('p', { text: '실행 범위와 최종 초안 전달 방식을 설정합니다. 단계별 글자 수·턴·타임아웃·분석 모드는 위의 각 단계 카드가 우선합니다.' })
    ]),
    guiEl('div', { class: 'sga-grid' }, [
      guiEl('div', { class: 'sga-card' }, [
        guiEl('h3', { text: '파이프라인 실행' }),
        runtimeField('전체 작동 모드', 'mode', { choices: [['off','끔'],['lite','라이트: SHADOW ACT + 플롯'],['normal','표준'],['full','전체 / 풍부한 초안']] }),
        runtimeField('최종 출력 방식', 'outputMode', { choices: [['draft_guided','기본 모드: SGA 최종 초안 → 메인 모델'],['risu_engine','확장 모드: RisuAI식 엔진 초안 → 메인 모델']] }),
        runtimeField('내장 작성 프리셋', 'builtInStylePreset', { choices: [['unified_stylepack','통합 작성 스타일팩']] }),
        runtimeField('실패 처리', 'failureMode', { choices: [['soft','Soft: 실패 단계만 건너뜀'],['degraded','Degraded: 이전 초안 폴백'],['hard','Hard: 오류 전파']] })
      ]),
      guiEl('div', { class: 'sga-card' }, [
        guiEl('h3', { text: '기본 라우팅 / 후속 처리' }),
        runtimeField('전역 기본 프로바이더 프리셋', 'defaultPresetName', { choices: presetNamesFromState().map(name => [name,name]), note: '단계 카드에서 프리셋을 따로 고르지 않았을 때 사용합니다.' }),
        runtimeField('후속 처리 모드', 'afterProcessMode', { choices: [['off','끔'],['audit','검사만'],['rewrite','수정본 반환']] }),
        runtimeField('빠른 설정 버튼', 'guiEnabled', { checkbox: true, checkboxLabel: 'RisuAI 메뉴에 SGA-RP 설정 바로가기 등록' }),
        runtimeField('디버그 로그', 'debugLog', { checkbox: true, checkboxLabel: '콘솔에 상세 실행 로그 출력' })
      ]),
      buildBackendHostingPanel(),
      guiEl('div', { class: 'sga-card' }, [
        guiEl('h3', { text: '초안 전달 / 주입' }),
        runtimeField('이전 단계 JSON 최대 글자', 'maxPreviousStageChars', { number: true, min: 1000, max: 60000 }),
        runtimeField('최종 draft 주입 최대 글자', 'maxInjectionChars', { number: true, min: 1500, max: 60000 }),
        runtimeField('주입 위치', 'injectionPosition', { choices: [['first_system','첫 system 앞에 삽입'],['last_system','마지막 system 다음에 삽입'],['before_last_user','마지막 user 직전에 삽입']] }),
        runtimeField('후속 편집 응답 최대 글자', 'afterMaxResponseChars', { number: true, min: 2000, max: 80000 })
      ]),
      guiEl('div', { class: 'sga-card' }, [
        guiEl('h3', { text: '목표 초안 길이' }),
        runtimeField('초안 최소 글자', 'targetDraftMinChars', { number: true, min: 100, max: 20000 }),
        runtimeField('초안 최대 글자', 'targetDraftMaxChars', { number: true, min: 500, max: 60000 }),
        guiEl('div', { class: 'sga-note', text: '각 단계의 “최대 글자”는 입력 컨텍스트 상한이고, 이 값은 작성되는 RP 초안의 권장 길이 범위입니다.' })
      ])
    ]),
    guiEl('details', { class: 'sga-advanced sga-runtime-legacy' }, [
      guiEl('summary', {}, [
        guiEl('span', { text: '호환용 전역 기본값' }),
        guiEl('span', { class: 'sga-advanced-hint', text: '기존 v0.7 설정·새 단계 생성 시 폴백' })
      ]),
      guiEl('div', { class: 'sga-advanced-body' }, [
        guiEl('div', { class: 'sga-callout', style: { marginBottom: '12px' }, text: '아래 값은 이전 버전 설정을 보존하고 새 단계 설정이 비어 있을 때만 사용합니다. 현재 단계 카드의 개별 값이 항상 우선합니다.' }),
        guiEl('div', { class: 'sga-row3' }, [
          runtimeField('전역 최근 턴 범위', 'turnWindow', { number: true, min: 2, max: 64 }),
          runtimeField('전역 최근 챗 최대 글자', 'maxRecentChars', { number: true, min: 2000, max: 100000 }),
          runtimeField('전역 단계 타임아웃(ms)', 'stageTimeoutMs', { number: true, min: 5000, max: 300000 })
        ]),
        guiEl('div', { class: 'sga-row3' }, [
          runtimeField('기존 AIDE 2-콜 기본값', 'twoCallAide', { checkbox: true, checkboxLabel: '분석 → 초안 작성 분리' }),
          runtimeField('기존 SHADOW RisuAI 참조', 'enableShadowRisuContext', { checkbox: true, checkboxLabel: '기존 참조 설정 유지' }),
          runtimeField('RisuAI 참조 최대 글자', 'shadowRisuContextMaxChars', { number: true, min: 1000, max: 80000 })
        ])
      ])
    ])
  ]);

  const exportConfiguration = (includeSecrets = false) => {
    const providers = cloneJson(Gui.state.providers || {});
    const runtime = cloneJson(Gui.state.runtime || {});
    if (!includeSecrets) {
      for (const preset of Object.values(providers)) {
        delete preset.key;
        delete preset.secret_deleted;
      }
      if (runtime.backendHosting) runtime.backendHosting.token = '';
    }
    return {
      kind: EXPORT_KIND,
      version: EXPORT_VERSION,
      pluginVersion: PLUGIN_VERSION,
      exportedAt: new Date().toISOString(),
      includesSecrets: includeSecrets,
      runtime,
      providerPresets: providers,
      agentSlots: guiAgentsWithCustomToStored(Gui.state.agents),
      postProcessors: guiPostsToStored(Gui.state.posts, Gui.state.runtime?.afterProcessMode),
      promptOverrides: guiPromptsToStored(Gui.state.prompts)
    };
  };

  const exportExecutionFlowPreset = () => {
    const requestedPresets = new Set();
    const runtime = cloneJson(Gui.state.runtime || {});
    if (runtime.backendHosting) runtime.backendHosting.token = '';
    const defaultName = text(Gui.state.runtime?.defaultPresetName || 'default').trim() || 'default';
    requestedPresets.add(defaultName);
    for (const def of BEFORE_STAGE_DEFS) requestedPresets.add(resolvedPresetNameForStage(def.id));
    for (const agent of (Gui.state.agents?.customAnalysisAgents || [])) requestedPresets.add(resolvedPresetNameForStage(agent.id));
    for (const agent of (Gui.state.posts?.customPostAgents || [])) requestedPresets.add(resolvedPresetNameForStage(agent.id));
    return {
      kind: FLOW_EXPORT_KIND,
      version: FLOW_EXPORT_VERSION,
      pluginVersion: PLUGIN_VERSION,
      exportedAt: new Date().toISOString(),
      requiredProviderPresets: [...requestedPresets].filter(Boolean),
      runtime,
      agentSlots: guiAgentsWithCustomToStored(Gui.state.agents),
      postProcessors: guiPostsToStored(Gui.state.posts, Gui.state.runtime?.afterProcessMode),
      promptOverrides: guiPromptsToStored(Gui.state.prompts)
    };
  };

  const selectedExportPayload = () => Gui.exportScope === 'all'
    ? exportConfiguration(Gui.includeSecretsInExport)
    : exportExecutionFlowPreset();

  const importedRuntimeToGui = (raw = {}, current = {}) => {
    const normalized = normalizeRuntimeRecord(raw);
    const pick = (snake, camel, fallback) => normalized[snake] ?? raw?.[camel] ?? fallback;
    return {
      ...current,
      mode: pick('mode', 'mode', current.mode),
      gradationMode: pick('gradation_mode', 'gradationMode', current.gradationMode || 'full_draft'),
      outputMode: normalizeChoice(pick('output_mode', 'outputMode', current.outputMode || 'draft_guided'), OUTPUT_MODES, 'draft_guided'),
      builtInStylePreset: normalizeBuiltInStylePreset(pick('built_in_style_preset', 'builtInStylePreset', current.builtInStylePreset || 'unified_stylepack')),
      turnWindow: Number(pick('turn_window', 'turnWindow', current.turnWindow)),
      maxRecentChars: Number(pick('max_recent_chars', 'maxRecentChars', current.maxRecentChars)),
      maxPreviousStageChars: Number(pick('max_previous_stage_chars', 'maxPreviousStageChars', current.maxPreviousStageChars)),
      maxInjectionChars: Number(pick('max_injection_chars', 'maxInjectionChars', current.maxInjectionChars)),
      injectionPosition: pick('injection_position', 'injectionPosition', current.injectionPosition),
      failureMode: pick('failure_mode', 'failureMode', current.failureMode),
      stageTimeoutMs: Number(pick('stage_timeout_ms', 'stageTimeoutMs', current.stageTimeoutMs)),
      defaultPresetName: pick('default_preset', 'defaultPresetName', current.defaultPresetName),
      afterProcessMode: pick('after_process_mode', 'afterProcessMode', current.afterProcessMode),
      afterMaxResponseChars: Number(pick('after_max_response_chars', 'afterMaxResponseChars', current.afterMaxResponseChars)),
      enableShadowRisuContext: asBool(pick('shadow_include_risu_context', 'enableShadowRisuContext', current.enableShadowRisuContext), current.enableShadowRisuContext !== false),
      shadowRisuContextMaxChars: Number(pick('shadow_risu_context_max_chars', 'shadowRisuContextMaxChars', current.shadowRisuContextMaxChars || DEFAULT_SHADOW_RISU_CONTEXT_CHARS)),
      twoCallAide: asBool(pick('two_call_aide', 'twoCallAide', current.twoCallAide), current.twoCallAide !== false),
      targetDraftMinChars: Number(pick('target_draft_min_chars', 'targetDraftMinChars', current.targetDraftMinChars || DEFAULT_TARGET_DRAFT_MIN_CHARS)),
      targetDraftMaxChars: Number(pick('target_draft_max_chars', 'targetDraftMaxChars', current.targetDraftMaxChars || DEFAULT_TARGET_DRAFT_MAX_CHARS)),
      backendHosting: normalizeBackendHostingConfig({
        ...(current.backendHosting || {}),
        ...(normalized.backendHosting && typeof normalized.backendHosting === 'object' ? normalized.backendHosting : {}),
        mode: pick('backend_hosting_mode', 'backendHostingMode', normalized.backendHosting?.mode ?? current.backendHosting?.mode ?? 'off'),
        url: pick('backend_hosting_url', 'backendHostingUrl', normalized.backendHosting?.url ?? current.backendHosting?.url ?? ''),
        token: pick('backend_hosting_token', 'backendHostingToken', normalized.backendHosting?.token ?? current.backendHosting?.token ?? ''),
        autoDetected: pick('backend_hosting_auto_detected', 'backendHostingAutoDetected', normalized.backendHosting?.autoDetected ?? current.backendHosting?.autoDetected ?? false),
        lastDetectedAt: pick('backend_hosting_last_detected_at', 'backendHostingLastDetectedAt', normalized.backendHosting?.lastDetectedAt ?? current.backendHosting?.lastDetectedAt ?? ''),
        lastManifest: pick('backend_hosting_last_manifest', 'backendHostingLastManifest', normalized.backendHosting?.lastManifest ?? current.backendHosting?.lastManifest ?? null)
      }),
      debugLog: asBool(pick('debug_log', 'debugLog', current.debugLog), !!current.debugLog),
      guiEnabled: asBool(pick('enable_gui', 'guiEnabled', current.guiEnabled), current.guiEnabled !== false)
    };
  };

  const importedAgentsToGui = (raw = {}, current = {}) => {
    const normalized = normalizeStoredAgentSlots(raw);
    const next = Object.fromEntries(BEFORE_STAGE_DEFS.map(def => [
      def.id,
      normalizeAgentSlot(normalized[def.id] || raw?.[def.id], current?.[def.id] || {
        enabled: true,
        presetName: '',
        maxChars: DEFAULT_STAGE_CONTEXT_CHARS,
        turnWindow: DEFAULT_RECENT_TURNS,
        timeoutMs: DEFAULT_STAGE_TIMEOUT_MS,
        executionMode: defaultExecutionModeForStage(def.id),
        risuRefs: defaultRisuReferencesForStage(def.id)
      }, def.id)
    ]));
    const hasCustom = Object.prototype.hasOwnProperty.call(raw || {}, 'custom_analysis_agents')
      || Object.prototype.hasOwnProperty.call(raw || {}, 'customAnalysisAgents')
      || Object.prototype.hasOwnProperty.call(raw?.slots || {}, 'custom_analysis_agents')
      || Object.prototype.hasOwnProperty.call(raw?.slots || {}, 'customAnalysisAgents');
    next.customAnalysisAgents = (hasCustom ? normalizeCustomAnalysisAgents(normalized.custom_analysis_agents) : (current?.customAnalysisAgents || []))
      .map((agent, index) => normalizeGuiCustomAnalysisAgent(agent, index));
    return next;
  };

  const importedPostsToGui = (raw = {}, current = {}) => {
    const normalized = normalizeStoredPostProcessors(raw);
    const hasCustom = Object.prototype.hasOwnProperty.call(raw || {}, 'custom_post_agents')
      || Object.prototype.hasOwnProperty.call(raw || {}, 'customPostAgents')
      || Object.prototype.hasOwnProperty.call(raw?.processors || {}, 'custom_post_agents')
      || Object.prototype.hasOwnProperty.call(raw?.processors || {}, 'customPostAgents');
    return {
      customPostAgents: (hasCustom ? normalizeCustomPostAgents(normalized.custom_post_agents) : (current?.customPostAgents || []))
        .map((agent, index) => normalizeGuiCustomPostAgent(agent, index))
    };
  };

  const importedPromptsToGui = (raw = {}, current = {}) => {
    const normalized = normalizeStoredPromptOverrides(raw);
    const next = {};
    for (const def of BEFORE_STAGE_DEFS) next[def.id] = normalizePromptEntry(normalized.before?.[def.id] || raw?.[def.id], current?.[def.id] || { mode: 'builtin', customPrompt: '', extraPrompt: '' });
    for (const def of LEGACY_POST_STAGE_DEFS) if (normalized.post?.[def.id] || raw?.[def.id]) next[def.id] = normalizePromptEntry(normalized.post?.[def.id] || raw?.[def.id], current?.[def.id] || { mode: 'builtin', customPrompt: '', extraPrompt: '' });
    return next;
  };

  const presetHasExplicitSecret = preset => !!preset && typeof preset === 'object' && [
    'key', 'api_key', 'apiKey', 'llm_key', 'token'
  ].some(field => Object.prototype.hasOwnProperty.call(preset, field));

  const normalizeImportedProviderBank = (rawBank = {}, currentBank = {}) => {
    const out = {};
    for (const [rawName, rawPreset] of Object.entries(rawBank || {})) {
      const name = String(rawName || '').trim();
      if (!name || !rawPreset || typeof rawPreset !== 'object' || Array.isArray(rawPreset)) continue;
      const normalized = sanitizePreset(rawPreset);
      if (!presetHasExplicitSecret(rawPreset)) {
        const existingSecret = text(currentBank?.[name]?.key || '').trim();
        if (existingSecret) normalized.key = existingSecret;
        else delete normalized.key;
      }
      out[name] = normalized;
    }
    return out;
  };

  const applyImportedConfiguration = (payload, merge = false) => {
    if (!payload || typeof payload !== 'object') throw new Error('가져올 JSON 객체가 아닙니다.');
    let source = payload;
    if (payload.kind && ![EXPORT_KIND, FLOW_EXPORT_KIND].includes(payload.kind)) throw new Error('Serial Gradation Agents for RP 설정 또는 실행 흐름 프리셋 파일이 아닙니다.');
    if (!payload.kind && payload.presets) source = { providerPresets: payload.presets };
    if (!payload.kind && !payload.providerPresets && !payload.runtime && Object.values(payload).every(item => item && typeof item === 'object')) source = { providerPresets: payload };

    if (source.providerPresets) {
      const importedProviders = normalizeImportedProviderBank(source.providerPresets, Gui.state.providers || {});
      Gui.state.providers = merge ? { ...Gui.state.providers, ...importedProviders } : importedProviders;
    }
    if (source.runtime) Gui.state.runtime = importedRuntimeToGui(source.runtime, Gui.state.runtime || {});
    if (source.agentSlots) Gui.state.agents = importedAgentsToGui(source.agentSlots, merge ? Gui.state.agents : {});
    if (source.postProcessors) {
      const normalizedPost = normalizeStoredPostProcessors(source.postProcessors);
      Gui.state.posts = importedPostsToGui(source.postProcessors, merge ? Gui.state.posts : {});
      if (normalizedPost.mode !== undefined) Gui.state.runtime.afterProcessMode = normalizeChoice(normalizedPost.mode, ['off', 'audit', 'rewrite'], Gui.state.runtime.afterProcessMode || 'off');
    }
    if (source.promptOverrides) Gui.state.prompts = importedPromptsToGui(source.promptOverrides, merge ? Gui.state.prompts : {});

    if (!Object.keys(Gui.state.providers || {}).length) throw new Error('프로바이더 프리셋이 하나도 없습니다.');
    for (const def of BEFORE_STAGE_DEFS) Gui.state.agents[def.id] = normalizeAgentSlot(Gui.state.agents?.[def.id], {
      enabled: true,
      presetName: '',
      maxChars: DEFAULT_STAGE_CONTEXT_CHARS,
      turnWindow: DEFAULT_RECENT_TURNS,
      timeoutMs: DEFAULT_STAGE_TIMEOUT_MS,
      executionMode: defaultExecutionModeForStage(def.id),
      risuRefs: defaultRisuReferencesForStage(def.id)
    }, def.id);
    if (!Gui.state.posts || typeof Gui.state.posts !== 'object') Gui.state.posts = {};
    Gui.state.posts.customPostAgents = (Gui.state.posts?.customPostAgents || [])
      .map((agent, index) => normalizeGuiCustomPostAgent(agent, index));
    Gui.state.agents.customAnalysisAgents = (Gui.state.agents?.customAnalysisAgents || [])
      .map((agent, index) => normalizeGuiCustomAnalysisAgent(agent, index));
    for (const def of ALL_STAGE_DEFS) Gui.state.prompts[def.id] = normalizePromptEntry(Gui.state.prompts?.[def.id], { mode: 'builtin', customPrompt: '', extraPrompt: '' });
    Gui.selectedPreset = Gui.state.providers.default ? 'default' : Object.keys(Gui.state.providers)[0];
    markGuiDirty();
  };



  const downloadJson = (name, payload) => {
    if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof document === 'undefined') return false;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  };

  const buildTransferTab = () => {
    const isFullExport = Gui.exportScope === 'all';
    const textarea = inputNode(Gui.importText, next => { Gui.importText = next; }, { tag: 'textarea', class: 'tall', placeholder: '실행 흐름 프리셋 또는 전체 설정 JSON을 붙여넣으세요.' });
    const fileInput = guiEl('input', { type: 'file', accept: 'application/json,.json', class: 'sga-hidden', onChange: async event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      try { Gui.importText = await file.text(); renderSettingsGui(); guiSetStatus(`${file.name} 파일을 읽었습니다.`); } catch (error) { guiSetStatus(error.message, true); }
    } });
    const scopeControls = guiEl('div', { class: 'sga-row2' }, [
      fieldNode('내보내기 범위', selectNode(Gui.exportScope || 'flow', [
        ['flow','실행 흐름 프리셋 · 에이전트/프롬프트/후속/런타임'],
        ['all','전체 설정 · 실행 흐름 + 프로바이더']
      ], next => { Gui.exportScope = next; renderSettingsGui(); }), isFullExport ? '프로바이더 프리셋도 함께 이동합니다.' : 'API 키와 프로바이더 정의는 제외하며, 대상 환경의 같은 이름 프리셋을 참조합니다.'),
      isFullExport
        ? fieldNode('비밀값', checkboxNode(Gui.includeSecretsInExport, 'API 키 / 토큰 / Vertex JSON 포함', next => { Gui.includeSecretsInExport = next; renderSettingsGui(); }), '체크하지 않으면 프로바이더 메타데이터만 내보냅니다.')
        : guiEl('div', { class: 'sga-provider-note-box' }, [
            guiEl('strong', { text: '기본 권장' }),
            guiEl('span', { text: '실행 흐름 프리셋은 비밀값을 포함하지 않습니다.' })
          ])
    ]);
    const downloadCurrent = () => {
      const payload = selectedExportPayload();
      const date = new Date().toISOString().slice(0, 10);
      const name = isFullExport ? `serial-gradation-agents-for-rp-config-${date}.json` : `serial-gradation-agents-for-rp-flow-${date}.json`;
      downloadJson(name, payload);
      guiSetStatus(isFullExport ? '전체 설정 JSON 파일을 생성했습니다.' : '실행 흐름 프리셋 JSON 파일을 생성했습니다.');
    };
    return guiEl('div', {}, [
      guiEl('div', { class: 'sga-section-title' }, [
        guiEl('h2', { text: 'JSON 프리셋 가져오기 / 내보내기' }),
        guiEl('p', { text: '실행 흐름만 재사용하거나, 필요할 때 프로바이더까지 포함한 전체 설정을 이동합니다.' })
      ]),
      guiEl('div', { class: 'sga-card wide' }, [
        scopeControls,
        isFullExport && Gui.includeSecretsInExport ? guiEl('div', { class: 'sga-callout danger', text: '내보낸 JSON에 API 키, 토큰 또는 Vertex 서비스 계정 JSON이 평문으로 포함됩니다. 안전한 장소에서만 사용하세요.', style: { marginBottom: '10px' } }) : null,
        textarea,
        fileInput,
        guiEl('div', { class: 'sga-actions', style: { marginTop: '10px' } }, [
          guiEl('button', { class: 'sga-btn primary', text: isFullExport ? '전체 설정 JSON 만들기' : '실행 흐름 JSON 만들기', onClick: () => { Gui.importText = JSON.stringify(selectedExportPayload(), null, 2); renderSettingsGui(); } }),
          guiEl('button', { class: 'sga-btn', text: 'JSON 파일로 저장', onClick: downloadCurrent }),
          guiEl('button', { class: 'sga-btn', text: '파일 열기', onClick: () => fileInput.click() }),
          guiEl('button', { class: 'sga-btn good', text: 'JSON으로 교체 가져오기', onClick: () => { try { applyImportedConfiguration(JSON.parse(Gui.importText), false); renderSettingsGui(); guiSetStatus('가져온 프리셋으로 GUI 상태를 교체했습니다. 상단 저장 버튼을 눌러 적용하세요.'); } catch (error) { guiSetStatus(error.message, true, true); } } }),
          guiEl('button', { class: 'sga-btn', text: 'JSON 병합 가져오기', onClick: () => { try { applyImportedConfiguration(JSON.parse(Gui.importText), true); renderSettingsGui(); guiSetStatus('가져온 프리셋을 현재 GUI 상태에 병합했습니다. 상단 저장 버튼을 눌러 적용하세요.'); } catch (error) { guiSetStatus(error.message, true, true); } } })
        ]),
        guiEl('div', { class: 'sga-note', style: { marginTop: '10px' }, text: '실행 흐름 프리셋을 가져왔을 때 같은 이름의 프로바이더 프리셋이 없으면 해당 단계 카드에 “프리셋 확인”이 표시됩니다.' })
      ]),
      guiEl('div', { class: 'sga-card wide', style: { marginTop: '14px' } }, [
        guiEl('h3', { text: '초기화' }),
        guiEl('div', { class: 'sga-note', text: 'GUI 저장 설정을 삭제하면 다시 //@arg 설정과 내장 기본값을 사용합니다.' }),
        guiEl('div', { class: 'sga-actions', style: { marginTop: '10px' } }, [
          guiEl('button', { class: 'sga-btn danger', text: 'GUI 설정 초기화(비밀 유지)', onClick: async () => {
            await clearStructuredSettings(false); await ensureGuiState(true); await renderSettingsGui(); guiSetStatus('GUI 설정을 초기화했습니다. 기기 로컬 비밀 키는 유지했습니다.');
          } }),
          guiEl('button', { class: 'sga-btn danger', text: '모든 설정과 비밀 키 초기화', onClick: async () => {
            await clearStructuredSettings(true); await ensureGuiState(true); await renderSettingsGui(); guiSetStatus('모든 저장 설정과 비밀 키를 초기화했습니다.');
          } })
        ])
      ])
    ]);
  };

  const runtimeForDisplay = () => ({
    version: PLUGIN_VERSION,
    runs: Runtime.runs,
    postRuns: Runtime.postRuns,
    secretStorage: Runtime.secretStorage,
    hookStatus: Runtime.hookStatus,
    migration: Runtime.migration,
    lastBefore: Runtime.last,
    lastAfter: Runtime.lastPost,
    warnings: Runtime.warnings.slice(-20),
    lastProviderRequest: Runtime.lastProviderRequest,
    lastProviderResponse: Runtime.lastProviderResponse,
    lastProviderError: Runtime.lastProviderError,
    lastBackendBridge: Runtime.lastBackendBridge,
    backendHosting: Runtime.settings?.backendHosting ? {
      ...Runtime.settings.backendHosting,
      token: Runtime.settings.backendHosting.token ? '[REDACTED]' : ''
    } : null,
    lastInjection: Runtime.lastInjection,
    lastSafeStage: Runtime.lastSafeStage,
    lastRisuContext: Runtime.lastRisuContext,
    risuEngine: Runtime.risuEngine,
    finalDraftMeta: Runtime.finalDraftMeta,
    finalDraft: Runtime.finalDraft || '',
    finalDraftPreview: compactMiddle(Runtime.finalDraft || '', 2000),
    analysisLedger: Runtime.analysisLedger,
    customAnalysisAgents: Runtime.settings?.customAnalysisAgents || [],
    customPostAgents: Runtime.settings?.customPostAgents || [],
    stageTrace: Runtime.stageTrace.slice(-32),
    postTrace: Runtime.postTrace.slice(-16)
  });

  const buildDebugTab = () => {
    const stageLabel = (id) => STAGE_DEF_MAP[id]?.label || [...Runtime.stageTrace, ...Runtime.postTrace].find(t => t.stage === id)?.parsed?.label || id;
    const debugPayloadText = () => JSON.stringify(runtimeForDisplay(), null, 2);
    const showDebugExportText = async (message = '디버그 JSON을 아래 텍스트 영역에 표시했습니다.', isError = false) => {
      Gui.debugExportText = debugPayloadText();
      await renderSettingsGui();
      guiSetStatus(message, isError, true);
    };
    const tracePill = (t, isPost) => {
      const state = t.ok ? 'ok' : (t.fallbackStage ? 'fallback' : 'skip');
      const label = stageLabel(t.stage);
      const elapsed = t.elapsedMs != null ? `${Math.round(t.elapsedMs)}ms` : '';
      const status = isPost ? (t.ok ? (t.skipped ? '건너뜀' : '완료') : '실패') : (t.ok ? '성공' : (t.fallbackStage ? '폴백' : '실패'));
      return guiEl('div', { class: `sga-summary-pill ${state}` }, [
        guiEl('span', { class: 'sga-summary-name', text: label }),
        guiEl('span', { class: 'sga-summary-state', text: status }),
        elapsed ? guiEl('span', { class: 'sga-summary-elapsed', text: elapsed }) : null
      ]);
    };
    const beforeTraceLimit = Math.max(16, BEFORE_STAGE_DEFS.length + (Gui.state?.agents?.customAnalysisAgents || []).length);
    const beforeTraces = Runtime.stageTrace.slice(-beforeTraceLimit);
    const postTraceLimit = Math.max(16, (Gui.state?.posts?.customPostAgents || []).length);
    const postTraces = Runtime.postTrace.slice(-postTraceLimit);
    const summaryBlocks = [];
    if (Runtime.inFlight) summaryBlocks.push(guiEl('div', { class: 'sga-inflight', text: '● 파이프라인 실행 중…' }));
    if (beforeTraces.length) summaryBlocks.push(guiEl('div', { class: 'sga-summary-row' }, [guiEl('span', { class: 'sga-summary-label', text: '응답 전' }), ...beforeTraces.map(t => tracePill(t, false))]));
    if (postTraces.length) summaryBlocks.push(guiEl('div', { class: 'sga-summary-row' }, [guiEl('span', { class: 'sga-summary-label', text: '응답 후' }), ...postTraces.map(t => tracePill(t, true))]));
    if (!summaryBlocks.length) summaryBlocks.push(guiEl('div', { class: 'sga-summary-empty', text: '아직 실행 기록이 없습니다. 응답을 한 번 생성하면 요약이 표시됩니다.' }));
    return guiEl('div', {}, [
      guiEl('div', { class: 'sga-section-title' }, [guiEl('h2', { text: '디버그' }), guiEl('p', { text: '마지막 응답 전/후 처리 상태, 단계별 프리셋, 경고와 최종 주입 설계안을 확인합니다.' })]),
      guiEl('div', { class: 'sga-actions', style: { marginBottom: '12px' } }, [
        guiEl('button', { class: 'sga-btn', text: '새로고침', onClick: () => renderSettingsGui() }),
        guiEl('button', { class: 'sga-btn', text: '디버그 JSON 복사', onClick: async () => {
          const payload = debugPayloadText();
          const result = await copyTextWithFallback(payload);
          if (result.ok) {
            Gui.debugExportText = '';
            await renderSettingsGui();
            guiSetStatus(result.method === 'clipboard' ? '디버그 JSON을 복사했습니다.' : '디버그 JSON을 fallback 복사 방식으로 복사했습니다.');
          } else {
            Gui.debugExportText = payload;
            await renderSettingsGui();
            guiSetStatus(`클립보드 복사가 차단되어 아래 텍스트 영역에 표시했습니다. ${result.error}`, true, true);
          }
        } }),
        guiEl('button', { class: 'sga-btn', text: '디버그 JSON 파일로 저장', onClick: async () => {
          const ok = downloadJson(`serial-gradation-agents-for-rp-debug-${new Date().toISOString().slice(0,10)}.json`, runtimeForDisplay());
          if (ok) guiSetStatus('디버그 JSON 파일을 생성했습니다.');
          else await showDebugExportText('파일 저장 API를 사용할 수 없어 아래 텍스트 영역에 표시했습니다.', true);
        } }),
        guiEl('button', { class: 'sga-btn', text: '디버그 JSON 표시', onClick: async () => {
          await showDebugExportText();
        } }),
        guiEl('button', { class: 'sga-btn danger', text: '경고 로그 지우기', onClick: () => { Runtime.warnings.length = 0; renderSettingsGui(); } })
      ]),
      Gui.debugExportText ? guiEl('div', { class: 'sga-card wide', style: { marginBottom: '12px' } }, [
        guiEl('h3', { text: '디버그 JSON 내보내기' }),
        guiEl('div', { class: 'sga-note', text: '클립보드가 차단된 환경에서는 아래 내용을 직접 선택해서 복사하거나 파일 저장 버튼을 사용하세요.' }),
        guiEl('textarea', { class: 'sga-textarea tall', readonly: true, value: Gui.debugExportText })
      ]) : null,
      guiEl('div', { class: 'sga-summary-panel' }, summaryBlocks),
      guiEl('div', { class: 'sga-grid' }, [
        guiEl('div', { class: 'sga-card' }, [guiEl('h3', { text: '마지막 실행 상태' }), guiEl('div', { class: 'sga-code', text: JSON.stringify({ lastBefore: Runtime.last, lastAfter: Runtime.lastPost, lastProviderError: Runtime.lastProviderError, hookStatus: Runtime.hookStatus, secretStorage: Runtime.secretStorage, migration: Runtime.migration, lastSafeStage: Runtime.lastSafeStage }, null, 2) })]),
        guiEl('div', { class: 'sga-card wide' }, [guiEl('h3', { text: '마지막 Provider 호출' }), guiEl('div', { class: 'sga-code', text: JSON.stringify({ request: Runtime.lastProviderRequest, response: Runtime.lastProviderResponse, error: Runtime.lastProviderError, backendBridge: Runtime.lastBackendBridge }, null, 2) || '(아직 provider 호출 기록 없음)' })]),
        guiEl('div', { class: 'sga-card' }, [guiEl('h3', { text: '최근 경고' }), guiEl('div', { class: 'sga-code', text: JSON.stringify(Runtime.warnings.slice(-20), null, 2) })]),
        guiEl('div', { class: 'sga-card wide' }, [guiEl('h3', { text: '마지막 SHADOW ACT RisuAI 참조' }), guiEl('div', { class: 'sga-code', text: Runtime.lastRisuContext ? JSON.stringify(Runtime.lastRisuContext, null, 2) : '(아직 참조 기록 없음)' })]),
        guiEl('div', { class: 'sga-card wide' }, [guiEl('h3', { text: '확장 모드 RisuAI식 엔진 기록' }), guiEl('div', { class: 'sga-code', text: Runtime.risuEngine ? JSON.stringify(Runtime.risuEngine, null, 2) : '(아직 확장 모드 실행 기록 없음)' })]),
        guiEl('div', { class: 'sga-card wide' }, [guiEl('h3', { text: 'SGA 최종 응답 초안' }), guiEl('div', { class: 'sga-code', text: Runtime.finalDraft || (Runtime.finalDraftMeta?.skipped ? `실행 안 됨: ${Runtime.finalDraftMeta.reason || 'unknown'}` : '(아직 최종 초안 없음)') })]),
        guiEl('div', { class: 'sga-card wide' }, [guiEl('h3', { text: '응답 전 에이전트 원문 추적' }), guiEl('div', { class: 'sga-code', text: JSON.stringify(Runtime.stageTrace.slice(-32), null, 2) || '(아직 실행 기록 없음)' })]),
        guiEl('div', { class: 'sga-card wide' }, [guiEl('h3', { text: '응답 후 편집 원문 추적' }), guiEl('div', { class: 'sga-code', text: JSON.stringify(Runtime.postTrace.slice(-16), null, 2) || '(아직 실행 기록 없음)' })]),
        guiEl('div', { class: 'sga-card wide' }, [guiEl('h3', { text: '마지막 메인 모델 주입 draft' }), guiEl('div', { class: 'sga-code', text: Runtime.lastInjection || '(아직 주입 기록 없음)' })])
      ])
    ]);
  };

  const buildMainResponseBridge = () => {
    const runtime = Gui.state.runtime || {};
    const mode = normalizeChoice(runtime.outputMode || 'draft_guided', OUTPUT_MODES, 'draft_guided');
    const guided = mode === 'draft_guided';
    const engine = mode === 'risu_engine';
    return guiEl('section', { class: 'sga-flow-section', id: 'sga-flow-main-response' }, [
      guiEl('div', { class: 'sga-card wide sga-main-response-card' }, [
        guiEl('div', { class: 'sga-agent-head' }, [
          guiEl('div', { class: 'sga-agent-title' }, [
            guiEl('span', { class: 'sga-agent-index main', text: 'M' }),
            guiEl('div', {}, [
              guiEl('h3', { text: '메인 응답 모델' }),
              guiEl('div', { class: 'sga-agent-desc compact', text: engine
                ? '확장 모드: SGA 최종 초안을 RisuAI식 promptTemplate/RAG 자체 엔진으로 한 번 더 구성한 뒤, 그 결과를 RisuAI 메인 응답 모델에 주입합니다.'
                : '기본 모드: SGA 최종 초안을 원래 요청에 주입하고, RisuAI 메인 응답 모델이 최종 응답을 다듬습니다.' })
            ])
          ]),
          guiEl('span', { class: `sga-badge ${guided ? 'good' : 'warn'}`, text: engine ? '자체 엔진' : '초안 주입' })
        ]),
        guiEl('div', { class: 'sga-main-response-grid' }, [
          guiEl('div', { class: 'sga-provider-note-box' }, [
            guiEl('strong', { text: '출력 방식' }),
            guiEl('span', { text: engine ? '확장 모드 · 엔진 초안 주입' : '기본 모드 · 메인 모델 다듬기' })
          ]),
          guiEl('div', { class: 'sga-provider-note-box' }, [
            guiEl('strong', { text: '주입 위치' }),
            guiEl('span', { text: runtime.injectionPosition || 'first_system' })
          ]),
          guiEl('div', { class: 'sga-provider-note-box' }, [
            guiEl('strong', { text: '최종 초안 상한' }),
            guiEl('span', { text: `${runtime.maxInjectionChars || DEFAULT_MAX_INJECTION_CHARS}자` })
          ])
        ]),
        guiEl('div', { class: 'sga-note', text: '출력 방식과 주입 위치는 아래 “런타임 / 주입 설정”에서 변경할 수 있습니다.' })
      ])
    ]);
  };

  const scrollGuiSectionIntoView = (selector) => {
    try {
      const target = Gui.root?.querySelector(selector) || (typeof document !== 'undefined' ? document.querySelector(selector) : null);
      if (target && typeof target.scrollIntoView === 'function') target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (_) {}
  };

  const buildExecutionFlowTab = () => {
    const runtime = Gui.state.runtime || {};
    const beforeEnabled = BEFORE_STAGE_DEFS.filter(def => Gui.state.agents?.[def.id]?.enabled).length;
    const customAgents = Gui.state.agents?.customAnalysisAgents || [];
    const customEnabled = customAgents.filter(agent => agent.enabled).length;
    const postAgents = Gui.state.posts?.customPostAgents || [];
    const postEnabled = postAgents.filter(agent => agent.enabled).length;
    const providerNames = presetNamesFromState();
    const configuredProviders = providerNames.filter(name => providerConfigured(Gui.state.providers?.[name])).length;
    const beforeMiniNodes = [];
    BEFORE_STAGE_DEFS.forEach(def => {
      beforeMiniNodes.push(guiEl('div', { class: `sga-flow-mini${Gui.state.agents?.[def.id]?.enabled ? '' : ' off'}` }, [
        guiEl('strong', { text: def.label }),
        guiEl('span', { text: resolvedPresetNameForStage(def.id) })
      ]));
      customAgents.forEach(agent => {
        if (agent.insertAfter !== def.id) return;
        beforeMiniNodes.push(guiEl('div', { class: `sga-flow-mini analysis${agent.enabled ? '' : ' off'}` }, [
          guiEl('strong', { text: agent.label || '분석 에이전트' }),
          guiEl('span', { text: `분석 · ${resolvedPresetNameForStage(agent.id)}` })
        ]));
      });
    });
    const jumpItems = [
      ['개요', '.sga-flow-overview-card'],
      ['에이전트', '#sga-flow-before'],
      ['메인 응답', '#sga-flow-main-response'],
      ['후속 편집', '#sga-flow-post'],
      ['런타임', '#sga-flow-runtime'],
      ['가져오기/내보내기', '#sga-flow-transfer'],
      ['디버그', '.sga-debug-fold']
    ];
    return guiEl('div', { class: 'sga-flow-page' }, [
      guiEl('div', { class: 'sga-section-title sga-flow-page-title' }, [
        guiEl('h2', { text: '설정 대시보드' }),
        guiEl('p', { text: '에이전트 흐름, 메인 응답, 후속 편집, 프로바이더 프리셋까지 한 화면에서 더 보기 쉽게 관리합니다.' })
      ]),
      guiEl('div', { class: 'sga-glance-grid' }, [
        guiEl('div', { class: 'sga-glance-card accent-purple' }, [
          guiEl('div', { class: 'sga-glance-top' }, [guiEl('span', { class: 'sga-glance-title', text: '응답 전 체인' }), guiEl('span', { class: 'sga-glance-kicker', text: runtime.mode === 'lite' ? 'Lite' : 'Before' })]),
          guiEl('div', { class: 'sga-glance-value', text: `${beforeEnabled}` }),
          guiEl('div', { class: 'sga-glance-label', text: '기본 작성 단계가 활성화되어 있습니다.' }),
          guiEl('div', { class: 'sga-glance-meta', text: `${customEnabled}개 분석 전용 에이전트 추가` })
        ]),
        guiEl('div', { class: 'sga-glance-card accent-green' }, [
          guiEl('div', { class: 'sga-glance-top' }, [guiEl('span', { class: 'sga-glance-title', text: '후속 편집' }), guiEl('span', { class: 'sga-glance-kicker', text: String(runtime.afterProcessMode || 'off').toUpperCase() })]),
          guiEl('div', { class: 'sga-glance-value', text: `${postEnabled}` }),
          guiEl('div', { class: 'sga-glance-label', text: '현재 활성화된 후속 편집 에이전트 수' }),
          guiEl('div', { class: 'sga-glance-meta', text: `${postAgents.length}개 등록됨` })
        ]),
        guiEl('div', { class: 'sga-glance-card accent-blue' }, [
          guiEl('div', { class: 'sga-glance-top' }, [guiEl('span', { class: 'sga-glance-title', text: '프로바이더 프리셋' }), guiEl('span', { class: 'sga-glance-kicker', text: resolvedPresetNameForStage('shadow_act') })]),
          guiEl('div', { class: 'sga-glance-value', text: `${configuredProviders}/${providerNames.length}` }),
          guiEl('div', { class: 'sga-glance-label', text: '즉시 사용 가능한 프리셋 수' }),
          guiEl('div', { class: 'sga-glance-meta', text: `전역 기본: ${runtime.defaultPresetName || 'default'}` })
        ]),
        guiEl('div', { class: 'sga-glance-card accent-amber' }, [
          guiEl('div', { class: 'sga-glance-top' }, [guiEl('span', { class: 'sga-glance-title', text: '초안 출력' }), guiEl('span', { class: 'sga-glance-kicker', text: runtime.outputMode === 'risu_engine' ? 'Engine' : 'Draft' })]),
          guiEl('div', { class: 'sga-glance-value', text: `${runtime.targetDraftMinChars || DEFAULT_TARGET_DRAFT_MIN_CHARS}~${runtime.targetDraftMaxChars || DEFAULT_TARGET_DRAFT_MAX_CHARS}` }),
          guiEl('div', { class: 'sga-glance-label', text: '권장 초안 길이 범위' }),
          guiEl('div', { class: 'sga-glance-meta', text: `주입 상한 ${runtime.maxInjectionChars || DEFAULT_MAX_INJECTION_CHARS}자` })
        ])
      ]),
      guiEl('div', { class: 'sga-quicknav' }, jumpItems.map(([label, selector]) => guiEl('button', { class: 'sga-quicknav-btn', text: label, onClick: () => scrollGuiSectionIntoView(selector) }))),
      guiEl('div', { class: 'sga-card wide sga-flow-overview-card' }, [
        guiEl('div', { class: 'sga-agent-head' }, [
          guiEl('h3', { text: '직렬 처리 흐름' }),
          guiEl('span', { class: `sga-badge ${Runtime.inFlight ? 'warn' : 'good'}`, text: Runtime.inFlight ? '실행 중' : '대기 중' })
        ]),
        guiEl('div', { class: 'sga-note', text: '각 단계는 이전 초안을 이어받아 같은 응답 시점에서 재작성합니다.' }),
        guiEl('div', { class: 'sga-flow-overview', style: { marginTop: '12px' } }, [
          ...beforeMiniNodes,
          guiEl('div', { class: 'sga-flow-mini main' }, [guiEl('strong', { text: '메인 응답' }), guiEl('span', { text: runtime.outputMode === 'risu_engine' ? '확장 모드' : '기본 모드' })]),
          ...postAgents.map(agent => guiEl('div', { class: `sga-flow-mini${agent.enabled && runtime.afterProcessMode !== 'off' ? '' : ' off'}` }, [
            guiEl('strong', { text: agent.label || '후속 편집' }),
            guiEl('span', { text: resolvedPresetNameForStage(agent.id) })
          ]))
        ])
      ]),
      buildAgentsTab(),
      guiEl('div', { class: 'sga-handoff sga-flow-major-handoff' }, [guiEl('span', { text: '↓ 최종 응답 초안을 메인 응답 단계로 전달' })]),
      buildMainResponseBridge(),
      guiEl('div', { class: 'sga-handoff sga-flow-major-handoff' }, [guiEl('span', { text: '↓ 메인 응답을 후속 편집으로 전달' })]),
      buildPostTab(),
      buildRuntimeTab(),
      guiEl('section', { class: 'sga-flow-section', id: 'sga-flow-transfer' }, [buildTransferTab()]),
      guiEl('details', { class: 'sga-advanced sga-debug-fold' }, [
        guiEl('summary', {}, [guiEl('span', { text: '디버그 / 실행 진단' }), guiEl('span', { class: 'sga-advanced-hint', text: '기존 진단 기능 보존' })]),
        guiEl('div', { class: 'sga-advanced-body' }, [buildDebugTab()])
      ])
    ]);
  };

  const renderActiveTab = () => Gui.activeTab === 'providers' ? buildProvidersTab() : buildExecutionFlowTab();

  async function renderSettingsGui() {
    if (typeof document === 'undefined') return false;
    await ensureGuiState();
    if (!Gui.root) return false;
    Gui.root.replaceChildren();
    const app = guiEl('div', { class: 'sga-app' });
    Gui.app = app;
    if (!['flow', 'providers'].includes(Gui.activeTab)) Gui.activeTab = 'flow';
    const tabs = [['flow','실행 흐름'],['providers','프로바이더']];
    const shortTabs = { flow: '실행 흐름', providers: '프로바이더' };
    app.appendChild(guiEl('header', { class: 'sga-top' }, [
      guiEl('div', { class: 'sga-brand' }, [guiEl('h1', { text: 'Serial Gradation Agents for RP' }), guiEl('p', { text: `v${PLUGIN_VERSION} · 실행 흐름과 프로바이더를 분리한 직렬 RP 제작·편집 파이프라인` })]),
      guiEl('div', { class: 'sga-head-actions' }, [
        guiEl('span', { class: 'sga-dirty', dataset: { dirty: String(Gui.dirty), dirtyBadge: 'true' }, text: Gui.dirty ? '저장되지 않은 변경' : '저장됨' }),
        guiEl('button', { class: 'sga-btn good', text: '전체 설정 저장', onClick: async () => {
          try { guiSetStatus('설정을 저장하고 있습니다…', false, true); await saveGuiState(); await renderSettingsGui(); guiSetStatus('프로바이더·에이전트·후속 편집·프롬프트·런타임 설정을 저장했습니다.'); } catch (error) { guiSetStatus(error.message || String(error), true, true); }
        } }),
        guiEl('button', { class: 'sga-btn', text: '닫기', onClick: async () => { Gui.visible = false; try { await API.hideContainer(); } catch (_) {} } })
      ])
    ]));
    app.appendChild(guiEl('nav', { class: 'sga-tabs' }, tabs.map(([id,label]) => guiEl('button', { class: 'sga-tab', dataset: { active: String(Gui.activeTab === id), shortLabel: shortTabs[id] || label }, onClick: () => { Gui.activeTab = id; renderSettingsGui(); } }, [guiEl('span', { class: 'sga-tab-full', text: label }), guiEl('span', { class: 'sga-tab-short', text: shortTabs[id] || label })]))));
    const main = guiEl('main', { class: 'sga-main' }, [guiEl('div', { class: 'sga-status', dataset: { guiStatus: 'true' } }), renderActiveTab()]);
    app.appendChild(main);
    Gui.root.appendChild(app);
    return true;
  }

  const waitForDocumentBody = async () => {
    if (typeof document === 'undefined') return null;
    if (document.body) return document.body;
    await new Promise(resolve => {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resolve, { once: true });
      else resolve();
      setTimeout(resolve, 250);
    });
    return document.body || null;
  };

  const initSettingsGui = async () => {
    try {
      const body = await waitForDocumentBody();
      if (!body) return false;
      await loadSettings();
      injectGuiStyle();
      const oldRoot = document.getElementById('sga-rp-gui-root');
      if (oldRoot) {
        if (typeof oldRoot.remove === 'function') oldRoot.remove();
        else if (oldRoot.parentNode) oldRoot.parentNode.removeChild(oldRoot);
        else if (oldRoot.parentElement) oldRoot.parentElement.removeChild?.(oldRoot);
      }
      const root = guiEl('div', { id: 'sga-rp-gui-root' });
      body.appendChild(root);
      Gui.root = root;
      await ensureGuiState(true);
      return true;
    } catch (error) {
      warn('settings_gui_init_failed', error);
      return false;
    }
  };

  const showSettingsGui = async () => {
    await loadSettings();
    Gui.visible = true;
    try { if (typeof API.showContainer === 'function') await API.showContainer('fullscreen'); } catch (error) { warn('settings_gui_show_failed', error); }
    if (!Gui.root || !document.getElementById('sga-rp-gui-root')) await initSettingsGui();
    await ensureGuiState(true);
    await renderSettingsGui();
    return true;
  };

  const registerPluginUi = async () => {
    try {
      const settings = await loadSettings();
      const open = async () => { await showSettingsGui(); };
      const icon = '⚙️';
      if (!registered.setting && typeof API.registerSetting === 'function') {
        registered.setting = await API.registerSetting('Serial Gradation Agents for RP 설정', open, icon, 'html');
        Runtime.hookStatus.setting = true;
      }
      if (settings.guiEnabled && !registered.button && typeof API.registerButton === 'function') {
        registered.button = await API.registerButton({ name: 'SGA-RP 설정', icon, iconType: 'html', location: 'hamburger' }, open);
        Runtime.hookStatus.button = true;
      }
      return true;
    } catch (error) {
      warn('settings_gui_register_failed', error);
      return false;
    }
  };

  const publicApi = Object.freeze({
    version: PLUGIN_VERSION,
    providers: Array.from(new Set([...PROVIDERS, ...Object.keys(DIRECT_LLM_PROVIDER_REGISTRY)])),
    providerPresets: JSON.parse(JSON.stringify(PROVIDER_PRESETS)),
    directProviderRegistry: JSON.parse(JSON.stringify(DIRECT_LLM_PROVIDER_REGISTRY)),
    reasoningPresets: JSON.parse(JSON.stringify(REASONING_PRESETS)),
    suggestedModels: {
      ollama_cloud: OLLAMA_CLOUD_SUGGESTED_MODELS.slice(),
      nanogpt: NANO_GPT_SUGGESTED_MODELS.slice(),
      deepseek: DEEPSEEK_SUGGESTED_MODELS.slice()
    },
    getRuntime: () => JSON.parse(JSON.stringify(Runtime)),
    async openSettingsGui() { return await showSettingsGui(); },
    async closeSettingsGui() { Gui.visible=false; try { if (typeof API.hideContainer === 'function') await API.hideContainer(); } catch(_){} return true; },
    async readGuiSettings() { return await readStoredSettings(); },
    async saveGuiSettings(settings) {
      const value = settings || {};
      if (value.runtime || value.agentSlots || value.postProcessors || value.promptOverrides) {
        const results = [];
        if (value.runtime) results.push(await writeRuntimeSettings(value.runtime));
        if (value.agentSlots) results.push(await writeAgentSlots(value.agentSlots));
        if (value.postProcessors) results.push(await writePostProcessors(value.postProcessors));
        if (value.promptOverrides) results.push(await writePromptOverrides(value.promptOverrides));
        Runtime.settings = null;
        return results.length ? results.every(Boolean) : true;
      }
      return await writeStoredSettings(value);
    },
    async resetGuiSettings() { return await removeStoredSettings(); },
    async getAgentSlots() { return await readAgentSlots(); },
    async saveAgentSlots(value) { Runtime.settings=null; return await writeAgentSlots(value || {}); },
    async getPostProcessors() { return await readPostProcessors(); },
    async savePostProcessors(value) { Runtime.settings=null; return await writePostProcessors(value || {}); },
    async getPromptOverrides() { return await readPromptOverrides(); },
    async savePromptOverrides(value) { Runtime.settings=null; return await writePromptOverrides(value || {}); },
    async getRuntimeSettings() { return await readRuntimeSettings(); },
    async saveRuntimeSettings(value) { Runtime.settings=null; return await writeRuntimeSettings(value || {}); },
    async listProviderPresets() { const settings=await loadSettings(); return JSON.parse(JSON.stringify(settings.presets || {})); },
    async listProviderModels(presetOrName = 'default', options = {}) {
      let preset = presetOrName;
      if (typeof presetOrName === 'string') {
        const settings = await loadSettings();
        preset = settings.presets?.[presetOrName] || settings.presets?.default || {};
      }
      return await listProviderModels(preset || {}, options || {});
    },
    resetProviderModelCache() { ProviderModelCache.clear(); return true; },
    async saveProviderPreset(name,preset) { const key=String(name||'').trim(); if(!key) throw new Error('프리셋 이름이 필요합니다.'); const bank=await readStoredPresetBank(); bank[key]=sanitizePreset(preset||{}); if(!await writeStoredPresetBank(bank)) throw new Error('프리셋 저장 실패'); Runtime.settings=null; return JSON.parse(JSON.stringify(bank[key])); },
    async deleteProviderPreset(name) { const key=String(name||'').trim(); const bank=await readStoredPresetBank(); delete bank[key]; Runtime.settings=null; return await writeStoredPresetBank(bank); },
    async listPresets() { const settings=await loadSettings(); return JSON.parse(JSON.stringify(settings.presets || {})); },
    async savePreset(name,preset) { const key=String(name||'').trim(); if(!key) throw new Error('프리셋 이름이 필요합니다.'); const bank=await readStoredPresetBank(); bank[key]=sanitizePreset(preset||{}); if(!await writeStoredPresetBank(bank)) throw new Error('프리셋 저장 실패'); Runtime.settings=null; return JSON.parse(JSON.stringify(bank[key])); },
    async deletePreset(name) { const key=String(name||'').trim(); const bank=await readStoredPresetBank(); delete bank[key]; Runtime.settings=null; return await writeStoredPresetBank(bank); },
    getStageTrace() { return JSON.parse(JSON.stringify(Runtime.stageTrace || [])); },
    getPostTrace() { return JSON.parse(JSON.stringify(Runtime.postTrace || [])); },
    getProviderDebug() { return JSON.parse(JSON.stringify({ request: Runtime.lastProviderRequest, response: Runtime.lastProviderResponse, error: Runtime.lastProviderError, backendBridge: Runtime.lastBackendBridge })); },
    getLastInjection() { return Runtime.lastInjection || ''; },
    getFinalDraft() { return Runtime.finalDraft || ''; },
    getFinalDraftMeta() { return JSON.parse(JSON.stringify(Runtime.finalDraftMeta || null)); },
    getLastRisuContext() { return JSON.parse(JSON.stringify(Runtime.lastRisuContext || null)); },
    getHookStatus() { return JSON.parse(JSON.stringify(Runtime.hookStatus || {})); },
    resolveCurrentUserInput(messages = []) {
      const resolved = resolveSgaCurrentTurn(messages);
      return JSON.parse(JSON.stringify({
        text: resolved.text || '',
        requestIndex: resolved.requestIndex,
        requestEndIndex: resolved.requestEndIndex,
        source: resolved.source,
        confidence: resolved.confidence,
        tag: resolved.tag || '',
        terminalPrefillIndex: resolved.terminalPrefillIndex
      }));
    },
    getProviderIssues(presetName = 'default') {
      const presets = Runtime.settings?.presets || {};
      return providerConfigurationIssues(presets[presetName] || presets.default || {});
    },
    resetMigrationRetry() { migrationPromise = null; return true; },
    async clearStoredPresets() { await RisuCompat.removeItem(STORAGE_PROVIDER_PRESETS_KEY); await RisuCompat.localRemoveItem(LOCAL_PROVIDER_SECRETS_KEY); Runtime.settings=null; return true; }
  });

  try {
    if (typeof API.addRisuReplacer === 'function') {
      registered.before = beforeRequest;
      registered.after = afterRequest;
      await API.addRisuReplacer('beforeRequest', beforeRequest);
      await API.addRisuReplacer('afterRequest', afterRequest);
      Runtime.hookStatus.beforeRequest = true;
      Runtime.hookStatus.afterRequest = true;
    } else {
      throw new Error('RisuAI addRisuReplacer API is unavailable.');
    }

    const unload = async () => {
      try {
        if (registered.before && typeof API.removeRisuReplacer === 'function') await API.removeRisuReplacer('beforeRequest', registered.before);
        Runtime.hookStatus.beforeRequest = false;
      } catch (_) {}
      try {
        if (registered.after && typeof API.removeRisuReplacer === 'function') await API.removeRisuReplacer('afterRequest', registered.after);
        Runtime.hookStatus.afterRequest = false;
      } catch (_) {}
      try {
        if (registered.setting && typeof API.unregisterUIPart === 'function') await API.unregisterUIPart(registered.setting.id || registered.setting);
        Runtime.hookStatus.setting = false;
      } catch (_) {}
      try {
        if (registered.button && typeof API.unregisterUIPart === 'function') await API.unregisterUIPart(registered.button.id || registered.button);
        Runtime.hookStatus.button = false;
      } catch (_) {}
      Runtime.hookStatus.unload = false;
    };
    try {
      if (typeof API.onUnload === 'function') { await API.onUnload(unload); Runtime.hookStatus.unload = true; }
      else if (typeof API.addEventListener === 'function') { await API.addEventListener('unload', unload); Runtime.hookStatus.unload = true; }
    } catch (_) {}

    try { globalThis.__SerialGradationAgentsForRP = publicApi; } catch (_) {}
    try { globalThis.__ShadowActSerialAIDE = publicApi; } catch (_) {} // legacy alias
    await initSettingsGui();
    await registerPluginUi();

    console.log(`[SGA-RP] Serial Gradation Agents for RP v${PLUGIN_VERSION} loaded.`);
  } catch (error) {
    console.warn('[SGA-RP] Failed to initialize:', error?.message || error);
  }
})();
