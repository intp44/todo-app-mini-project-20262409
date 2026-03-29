import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://todo-app-mini-project-20262409.vercel.app/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [second, setSecond] = useState('00');

  // 초기 시간 설정
  useEffect(() => {
    const now = new Date();
    setHour(now.getHours().toString().padStart(2, '0'));
    setMinute(now.getMinutes().toString().padStart(2, '0'));
  }, []);

  // 최신 todos를 타이머 안에서 참조하기 위한 ref
  const todosRef = useRef([]);
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  // 초기 데이터 로딩 및 알람 타이머 설정
  useEffect(() => {
    fetchTodos();
    const timer = setInterval(() => {
      checkAlarms();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (err) {
      console.error("데이터 로딩 실패", err);
    }
  };

  const checkAlarms = () => {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // "HH:mm:ss"

    todosRef.current.forEach(todo => {
      if (!todo.completed && todo.alarmTime === currentTime) {
        alert(`🔔 [알림] "${todo.title}" 작업 시간입니다!`);
      }
    });
  };

  const pad = (num) => num.toString().padStart(2, '0');

  const handleBlur = (setter, value) => {
    setter(pad(value));
  };

  const addTodo = async () => {
    if (!newTodo) {
      alert("할 일을 입력해주세요!");
      return;
    }

    const finalAlarmTime = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
    
    try {
      await axios.post(API_URL, { 
        title: newTodo, 
        alarmTime: finalAlarmTime 
      });
      
      setNewTodo('');
      const now = new Date();
      setHour(now.getHours().toString().padStart(2, '0'));
      setMinute(now.getMinutes().toString().padStart(2, '0'));
      setSecond('00');
      fetchTodos();
    } catch (err) {
      console.error("추가 실패", err);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await axios.put(`${API_URL}/${id}`, { completed: !completed });
      fetchTodos();
    } catch (err) { console.error(err); }
  };

  const deleteTodo = async (id) => {
    if(window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchTodos();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="dark-theme app-layout">
      {/* --- 좌측 사이드바 설명문 --- */}
      <aside className="sidebar">
        <div className="sidebar-content">
          <h2 className="sidebar-title">Project Info</h2>
          <div className="sidebar-section">
            <h3>설명</h3>
            <p>
              {/* 이 텍스트를 원하는 내용으로 수정하세요 */}
              Smart Alarmed TODO List는 사용자가 설정한 시간에 실시간으로 
              알림을 제공하여 효율적인 일정 관리를 돕는 도구입니다.
                  브라우저 팝업을 허용하시면 알림을 받으실 수 있습니다.

              페이지가 새로고침 될때 마다 시간이 업데이트됩니다
            </p>
          </div>
          <div className="sidebar-section">
            <h3>주요 기능</h3>
            <ul>
              <li>실시간 초단위 알람</li>
              <li>눈이 피로하지 않은 세련된 디자인의 다크 모드 UI</li>
              <li>할 일 상태 토글 및 관리</li>
            </ul>
          </div>
          <div className="sidebar-section">
            <h3>기술 스택</h3>
            <p>React, Node.js, Express, MongoDB</p>
          </div>
        </div>
      </aside>

      {/* --- 우측 메인 콘텐츠 --- */}
      <main className="main-content">
        <div className="app-container">
          <h1 className="main-title">Smart Alarmed TODO List</h1>
          
          <div className="input-group">
            <input 
              className="text-input"
              type="text" 
              value={newTodo} 
              onChange={(e) => setNewTodo(e.target.value)} 
              placeholder="수행할 작업을 입력하세요..." 
            />
            <div className="time-picker-custom">
              <input 
                type="number" 
                min="0" 
                max="23" 
                value={hour} 
                onChange={(e) => setHour(e.target.value.slice(0, 2))} 
                onBlur={(e) => handleBlur(setHour, e.target.value)}
                placeholder="HH" 
              />
              <span>:</span>
              <input 
                type="number" 
                min="0" 
                max="59" 
                value={minute} 
                onChange={(e) => setMinute(e.target.value.slice(0, 2))} 
                onBlur={(e) => handleBlur(setMinute, e.target.value)}
                placeholder="mm" 
              />
              <span>:</span>
              <input 
                type="number" 
                min="0" 
                max="59" 
                value={second} 
                onChange={(e) => setSecond(e.target.value.slice(0, 2))} 
                onBlur={(e) => handleBlur(setSecond, e.target.value)}
                placeholder="ss" 
              />
            </div>  
            <button className="add-btn" onClick={addTodo}>추가</button>
          </div>

          <div className="todo-grid">
            {todos.map(todo => (
              <div key={todo._id} className={`todo-card ${todo.completed ? 'is-completed' : ''}`}>
                <div className="card-content">
                  <div className="time-badge">
                    {todo.alarmTime ? `⏰ 시작 시간: ${todo.alarmTime}` : '⏰ 시간 기록 없음'}
                  </div>
                  <h3 className="todo-text">{todo.title}</h3>
                </div>
                <div className="card-actions">
                  <button className="check-icon" onClick={() => toggleTodo(todo._id, todo.completed)}>
                    {todo.completed ? '↺' : '✓'}
                  </button>
                  <button className="remove-icon" onClick={() => deleteTodo(todo._id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;