const API_BASE_URL = '/api';

class VitalsApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async makeRequest(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error('Vitals API Error:', error);
      throw error;
    }
  }

  // Log vitals data
  async logVitalsData(userId, metricType, valueData, dateLogged = null) {
    return this.makeRequest('/vitals/log', {
      user_id: userId,
      metric_type: metricType,
      value_data: valueData,
      date_logged: dateLogged,
    });
  }

  // Get vitals data for a date range
  async getVitalsData(userId, metricType, startDate = null, endDate = null) {
    return this.makeRequest('/vitals/get_data', {
      user_id: userId,
      metric_type: metricType,
      start_date: startDate,
      end_date: endDate,
    });
  }

  // Get streak for a specific metric
  async getVitalsStreak(userId, metricType) {
    return this.makeRequest('/vitals/get_streak', {
      user_id: userId,
      metric_type: metricType,
    });
  }

  // Get all vitals streaks for a user
  async getAllVitalsStreaks(userId) {
    return this.makeRequest('/vitals/get_all_streaks', {
      user_id: userId,
    });
  }

  // Get vitals summary for dashboard
  async getVitalsSummary(userId, metricType, daysBack = 7) {
    return this.makeRequest('/vitals/get_summary', {
      user_id: userId,
      metric_type: metricType,
      days_back: daysBack,
    });
  }

  // Get chart data for vitals
  async getVitalsChartData(userId, metricType, rangeKey = '1w') {
    return this.makeRequest('/vitals/get_chart_data', {
      user_id: userId,
      metric_type: metricType,
      range_key: rangeKey,
    });
  }

  // Get today's vitals logs for a specific metric
  async getTodayVitalsLogs(userId, metricType) {
    return this.makeRequest('/vitals/get_today_logs', {
      user_id: userId,
      metric_type: metricType,
    });
  }

  // Create custom metric
  async createCustomMetric(userId, metricName, metricType, unit = null, targetValue = null, options = null) {
    return this.makeRequest('/vitals/create_custom_metric', {
      user_id: userId,
      metric_name: metricName,
      metric_type: metricType,
      unit: unit,
      target_value: targetValue,
      options: options,
    });
  }

  // Get custom metrics
  async getCustomMetrics(userId) {
    return this.makeRequest('/vitals/get_custom_metrics', {
      user_id: userId,
    });
  }

  // Update custom metric
  async updateCustomMetric(userId, metricId, updates) {
    return this.makeRequest('/vitals/update_custom_metric', {
      user_id: userId,
      metric_id: metricId,
      updates: updates,
    });
  }

  // Delete custom metric
  async deleteCustomMetric(userId, metricId) {
    return this.makeRequest('/vitals/delete_custom_metric', {
      user_id: userId,
      metric_id: metricId,
    });
  }
}

const vitalsApiService = new VitalsApiService();

export default vitalsApiService; 