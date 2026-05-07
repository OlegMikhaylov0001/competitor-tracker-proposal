/**
 * Competitor Tracker MVP - Pricing Configuration
 * Single source of truth for all pricing data
 *
 * Change one value and all HTML files automatically update
 */

const PRICING = {
  // ========== BASE RATES ==========
  HOURLY_RATE: 15,                    // Основная ставка в долларах
  DEVELOPMENT_HOURS: 80,               // Часы разработки MVP (3 недели) - без веб-панели
  DEVELOPMENT_HOURS_PHASE_2: 40,       // Часы разработки Phase 2 (веб-панель)
  CLOUDMAX_MONTHLY: 100,               // CloudMax подписка (один раз)
  INFRASTRUCTURE_MONTHLY: 119,         // Ежемесячные расходы на инфраструктуру

  // ========== CALCULATED VALUES - MVP ==========
  get DEVELOPMENT_COST() {
    return this.HOURLY_RATE * this.DEVELOPMENT_HOURS;  // $1,200
  },

  get MONTH_1_TOTAL() {
    return this.DEVELOPMENT_COST + this.CLOUDMAX_MONTHLY + this.INFRASTRUCTURE_MONTHLY;  // $1,419
  },

  get YEAR_1_MONTHS_2_12() {
    return this.INFRASTRUCTURE_MONTHLY * 11;  // $1,309
  },

  get YEAR_1_TOTAL() {
    return this.MONTH_1_TOTAL + this.YEAR_1_MONTHS_2_12;  // $2,728
  },

  get MONTHLY_AVERAGE() {
    return Math.round(this.YEAR_1_TOTAL / 12);  // $227
  },

  // ========== PHASE 2 ==========
  get PHASE_2_COST() {
    return this.HOURLY_RATE * this.DEVELOPMENT_HOURS_PHASE_2;  // $600
  },

  get YEAR_1_WITH_PHASE_2() {
    return this.YEAR_1_TOTAL + this.PHASE_2_COST;  // $3,328
  },

  // ========== COMPONENT BREAKDOWN (в часах) ==========
  COMPONENTS: {
    slack: {
      name: 'Интеграция Slack',
      hours: 16,
      description: 'Бот, вебхуки, форматирование, тестирование'
    },
    monitoring: {
      name: 'Система мониторинга новостей',
      hours: 24,
      description: 'RSS ленты, 50+ источников, агрегация'
    },
    database: {
      name: 'Хранилище и БД (Render.com)',
      hours: 12,
      description: 'PostgreSQL, схема, миграции, резервные копии'
    },
    claude: {
      name: 'Claude 3.5 Sonnet конфигурация',
      hours: 16,
      description: 'API интеграция, промпты, анализ, рекомендации'
    },
    testing: {
      name: 'Тестирование и QA',
      hours: 12,
      description: 'Проверка компонентов, интеграция, развёртывание'
    }
  },

  // ========== OPTIONAL PHASE 2 (Веб-панель для анализа) ==========
  OPTIONAL_PHASE_2: {
    dashboard: {
      name: 'Веб-панель для просмотра и анализа',
      hours: 40,
      description: 'Интерфейс, поиск, анализ, исторические данные, экспорт'
    }
  },

  // ========== INFRASTRUCTURE BREAKDOWN (ежемесячно) ==========
  INFRASTRUCTURE: {
    render: { cost: 12, name: 'Render.com (Node.js + PostgreSQL)', mandatory: true },
    claude_api: { cost: 125, name: 'Claude 3.5 Sonnet API (100-150 алертов/день, ~7-8 млн токенов с Prompt Caching)', mandatory: true, min: 100, max: 150 },
    rss: { cost: 15, name: 'RSS мониторинг (50+ источников)', mandatory: false },
    monitoring: { cost: 15, name: 'Мониторинг & uptime', mandatory: false },
    domain: { cost: 1, name: 'Домен и сертификаты', mandatory: true }
  },

  // ========== INFRASTRUCTURE TOTALS ==========
  get MANDATORY_INFRASTRUCTURE() {
    return this.INFRASTRUCTURE.render.cost + this.INFRASTRUCTURE.claude_api.cost + this.INFRASTRUCTURE.domain.cost;  // $94
  },

  get OPTIONAL_INFRASTRUCTURE() {
    return this.INFRASTRUCTURE.rss.cost + this.INFRASTRUCTURE.monitoring.cost;  // $25
  },

  // ========== HELPER FUNCTIONS ==========

  /**
   * Форматирует число как цену: 1200 -> $1,200
   */
  formatPrice(amount) {
    return '$' + amount.toLocaleString('en-US');
  },

  /**
   * Получает стоимость компонента
   */
  getComponentCost(componentKey) {
    const component = this.COMPONENTS[componentKey];
    if (!component) return 0;
    return component.hours * this.HOURLY_RATE;
  },

  /**
   * Получает все компоненты с рассчитанной стоимостью
   */
  getComponentsWithCosts() {
    const result = {};
    for (const [key, component] of Object.entries(this.COMPONENTS)) {
      result[key] = {
        ...component,
        cost: component.hours * this.HOURLY_RATE,
        costFormatted: this.formatPrice(component.hours * this.HOURLY_RATE)
      };
    }
    return result;
  },

  /**
   * Проверяет сумму компонентов
   */
  verifyComponentSum() {
    let sum = 0;
    let hours = 0;
    for (const component of Object.values(this.COMPONENTS)) {
      sum += component.hours * this.HOURLY_RATE;
      hours += component.hours;
    }
    return {
      totalHours: hours,
      totalCost: sum,
      isCorrect: sum === this.DEVELOPMENT_COST && hours === this.DEVELOPMENT_HOURS,
      message: `${hours} часов = $${sum} (должно быть ${this.DEVELOPMENT_HOURS} часов = $${this.DEVELOPMENT_COST})`
    };
  },

  /**
   * Получает все данные для отчёта
   */
  getSummary() {
    return {
      hourlyRate: this.HOURLY_RATE,
      developmentHours: this.DEVELOPMENT_HOURS,
      developmentCost: this.formatPrice(this.DEVELOPMENT_COST),
      cloudmax: this.formatPrice(this.CLOUDMAX_MONTHLY),
      infrastructureMonthly: this.formatPrice(this.INFRASTRUCTURE_MONTHLY),
      month1Total: this.formatPrice(this.MONTH_1_TOTAL),
      year1Total: this.formatPrice(this.YEAR_1_TOTAL),
      monthlyAverage: this.formatPrice(this.MONTHLY_AVERAGE),
      verification: this.verifyComponentSum()
    };
  }
};

/**
 * Вспомогательная функция для вставки цен в HTML
 * Использование: <span data-price="month1">loading...</span>
 */
function updatePrices() {
  const priceElements = document.querySelectorAll('[data-price]');

  const priceMap = {
    'month1': PRICING.formatPrice(PRICING.MONTH_1_TOTAL),
    'monthly': PRICING.formatPrice(PRICING.INFRASTRUCTURE_MONTHLY),
    'year1': PRICING.formatPrice(PRICING.YEAR_1_TOTAL),
    'year1_with_phase2': PRICING.formatPrice(PRICING.YEAR_1_WITH_PHASE_2),
    'development': PRICING.formatPrice(PRICING.DEVELOPMENT_COST),
    'cloudmax': PRICING.formatPrice(PRICING.CLOUDMAX_MONTHLY),
    'hourly_rate': PRICING.HOURLY_RATE,
    'dev_hours': PRICING.DEVELOPMENT_HOURS,
    'avg_monthly': PRICING.formatPrice(PRICING.MONTHLY_AVERAGE),
    'mandatory_infra': PRICING.formatPrice(PRICING.MANDATORY_INFRASTRUCTURE),
    'optional_infra': PRICING.formatPrice(PRICING.OPTIONAL_INFRASTRUCTURE),
    'phase_2_cost': PRICING.formatPrice(PRICING.PHASE_2_COST),
    'phase_2_hours': PRICING.DEVELOPMENT_HOURS_PHASE_2,
    'months_2_12_cost': PRICING.formatPrice(PRICING.YEAR_1_MONTHS_2_12)
  };

  priceElements.forEach(element => {
    const key = element.getAttribute('data-price');
    if (priceMap[key]) {
      element.textContent = priceMap[key];
    }
  });

  // Update individual infrastructure items
  const infraItems = {
    'infra-render': PRICING.INFRASTRUCTURE.render.cost,
    'infra-claude': PRICING.INFRASTRUCTURE.claude_api.cost,
    'infra-rss': PRICING.INFRASTRUCTURE.rss.cost,
    'infra-monitoring': PRICING.INFRASTRUCTURE.monitoring.cost,
    'infra-domain': PRICING.INFRASTRUCTURE.domain.cost
  };

  for (const [className, cost] of Object.entries(infraItems)) {
    const elements = document.querySelectorAll('.' + className);
    elements.forEach(el => {
      el.textContent = cost;
    });
  }
}

// Автоматически обновить цены когда DOM готов
document.addEventListener('DOMContentLoaded', updatePrices);

// Экспортируем для использования в других скриптах (если нужно)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRICING;
}
