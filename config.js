/**
 * Competitor Tracker MVP - Pricing Configuration
 * Single source of truth for all pricing data
 *
 * Change one value and all HTML files automatically update
 */

const PRICING = {
  // ========== BASE RATES ==========
  HOURLY_RATE: 15,                    // Основная ставка в долларах
  DEVELOPMENT_HOURS: 120,              // Часы разработки (3 недели)
  CLOUDMAX_MONTHLY: 100,               // CloudMax подписка (один раз)
  INFRASTRUCTURE_MONTHLY: 119,         // Ежемесячные расходы на инфраструктуру

  // ========== CALCULATED VALUES ==========
  get DEVELOPMENT_COST() {
    return this.HOURLY_RATE * this.DEVELOPMENT_HOURS;  // $1,800
  },

  get MONTH_1_TOTAL() {
    return this.DEVELOPMENT_COST + this.CLOUDMAX_MONTHLY + this.INFRASTRUCTURE_MONTHLY;  // $2,019
  },

  get YEAR_1_MONTHS_2_12() {
    return this.INFRASTRUCTURE_MONTHLY * 11;  // $1,309
  },

  get YEAR_1_TOTAL() {
    return this.MONTH_1_TOTAL + this.YEAR_1_MONTHS_2_12;  // $3,328
  },

  get MONTHLY_AVERAGE() {
    return Math.round(this.YEAR_1_TOTAL / 12);  // $277
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
    dashboard: {
      name: 'Веб-панель',
      hours: 40,
      description: 'Интерфейс, поиск, анализ, исторические данные'
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

  // ========== INFRASTRUCTURE BREAKDOWN (ежемесячно) ==========
  INFRASTRUCTURE: {
    render: { cost: 12, name: 'Render.com (Node.js + PostgreSQL)' },
    claude_api: { cost: 81, name: 'Claude 3.5 Sonnet API (100-150 алертов/день)' },
    rss: { cost: 15, name: 'RSS мониторинг (50+ источников)' },
    monitoring: { cost: 10, name: 'Мониторинг & uptime' },
    domain: { cost: 1, name: 'Домен и сертификаты' }
  },

  // ========== HELPER FUNCTIONS ==========

  /**
   * Форматирует число как цену: 1800 -> $1,800
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
    'development': PRICING.formatPrice(PRICING.DEVELOPMENT_COST),
    'cloudmax': PRICING.formatPrice(PRICING.CLOUDMAX_MONTHLY),
    'hourly_rate': PRICING.HOURLY_RATE,
    'dev_hours': PRICING.DEVELOPMENT_HOURS,
    'avg_monthly': PRICING.formatPrice(PRICING.MONTHLY_AVERAGE)
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
