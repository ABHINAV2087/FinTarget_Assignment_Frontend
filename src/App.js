import React, { useEffect, useState, useCallback } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  CandlestickController,
  CandlestickElement,
} from 'chartjs-chart-financial';
import './App.css'; 

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

const App = () => {
  const [chartData, setChartData] = useState(null);
  const [coin, setCoin] = useState('ETHUSDT');
  const [interval, setInterval] = useState('1m');
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');

  const loadPreferences = () => {
    const savedCoin = localStorage.getItem('selectedCoin');
    const savedTimeframe = localStorage.getItem('selectedTimeframe');

    if (savedCoin) {
      setCoin(savedCoin);
    }

    if (savedTimeframe) {
      setInterval(savedTimeframe);
    }
  };

  const fetchData = useCallback(async (coinSymbol, interval) => {
    try {
      setLoading(true);

      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${coinSymbol}&interval=${interval}&limit=100`);
      const data = await response.json();

      const formattedData = {
        labels: data.map(item => new Date(item[0])),
        datasets: [
          {
            label: 'Price',
            data: data.map(item => parseFloat(item[1])),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
            fill: chartType === 'line',
          },
        ],
      };

      const candlestickData = data.map(item => ({
        x: new Date(item[0]),
        o: parseFloat(item[1]),
        h: parseFloat(item[3]),
        l: parseFloat(item[4]),
        c: parseFloat(item[2]),
      }));

      setChartData({
        lineBarData: formattedData,
        candlestickData: candlestickData,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  }, [chartType]);

  useEffect(() => {
    loadPreferences();
    fetchData(coin, interval);
  }, [coin, interval, fetchData]);

  const savePreferences = () => {
    localStorage.setItem('selectedCoin', coin);
    localStorage.setItem('selectedTimeframe', interval);
  };

  const handleCoinChange = (event) => {
    const selectedCoin = event.target.value;
    setCoin(selectedCoin);
    savePreferences();
    fetchData(selectedCoin, interval);
  };

  const handleTimeframeChange = (event) => {
    const selectedTimeframe = event.target.value;
    setInterval(selectedTimeframe);
    savePreferences();
    fetchData(coin, selectedTimeframe);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 
            interval === "1m" ? 'minute' :
            interval === "5m" ? 'minute' :
            interval === "1h" ? 'hour' :
            interval === "1d" ? 'day' :
            interval === "1w" ? 'week' :
            'month',
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="app-container">
      <h1 className="app-title">CryptoVision</h1>
      <div className="controls">
        <div className="control-item">
          <label htmlFor="coin-select">Select Coin:</label>
          <select id="coin-select" value={coin} onChange={handleCoinChange}>
            <option value="ETHUSDT">Ethereum (ETH/USDT)</option>
            <option value="BTCUSDT">Bitcoin (BTC/USDT)</option>
            <option value="LTCUSDT">Litecoin (LTC/USDT)</option>
            <option value="BNBUSDT">Binance Coin (BNB/USDT)</option>
          </select>
        </div>
        <div className="control-item">
          <label htmlFor="interval-select">Select Time Frame:</label>
          <select id="interval-select" value={interval} onChange={handleTimeframeChange}>
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
            <option value="1M">1 Month</option>
          </select>
        </div>
        <div className="control-item">
          <label htmlFor="chart-type-select">Select Chart Type:</label>
          <select id="chart-type-select" value={chartType} onChange={handleChartTypeChange}>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="candlestick">Candlestick Chart</option>
          </select>
        </div>
      </div>
      <div className="chart-container">
        {loading ? (
          <p>Loading chart data...</p>
        ) : (
          chartData && (
            <>
              {chartType === 'candlestick' ? (
                <Line 
                  data={{
                    datasets: [
                      {
                        label: 'Candlestick Chart',
                        data: chartData.candlestickData,
                        type: 'candlestick',
                      },
                    ],
                  }}
                  options={options}
                />
              ) : (
                (chartType === 'line' || chartType === 'bar') && (
                  chartType === 'line' ? 
                    <Line data={chartData.lineBarData} options={options} /> : 
                    <Bar data={chartData.lineBarData} options={options} />
                )
              )}
            </>
          )
        )}
      </div>
    </div>
  );
};

export default App;
