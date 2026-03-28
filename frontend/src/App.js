import React, { useState, useEffect, useRef } from 'react'; // useRef 추가
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5001/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [second, setSecond] = useState('00');
  useEffect(() => {
    const now = new Date();
    // 현재 시와 분을 가져와서 두 자리 문자열(09, 12 등)로 만듭니다.
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    
    setHour(currentHour);
    setMinute(currentMinute);
    // 초(second)는 보통 정각에 맞추는 게 편하니 '00' 그대로 둡니다.
  }, []);

  // 최신 todos를 타이머 안에서 참조하기 위한 ref
  const todosRef = useRef([]);
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  useEffect(() => {
    fetchTodos();
    // 타이머를 한 번만 설정하여 성능을 높이고 중복 실행을 방지합니다.
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

    // ref를 통해 최신 할 일 목록을 확인합니다.
    todosRef.current.forEach(todo => {
      if (!todo.completed && todo.alarmTime === currentTime) {
        alert(`🔔 [알림] "${todo.title}" 작업 시간입니다!`);
      }
    });
  };

  const pad = (num) => num.toString().padStart(2, '0');

  // 입력창에서 포커스가 나갈 때 자동으로 05, 09 처럼 두 자리로 변환
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
    <div className="dark-theme">
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
    onChange={(e) => setHour(e.target.value.slice(0, 2))} // 최대 2자리 제한 추가
    onBlur={(e) => handleBlur(setHour, e.target.value)}
    placeholder="HH" 
  />
  <span>:</span>
            <input 
    type="number" 
    min="0" 
    max="59" 
    value={minute} 
    onChange={(e) => setMinute(e.target.value.slice(0, 2))} // 최대 2자리 제한 추가
    onBlur={(e) => handleBlur(setMinute, e.target.value)}
    placeholder="mm" 
  />
  <span>:</span>
            <input 
    type="number" 
    min="0" 
    max="59" 
    value={second} 
    onChange={(e) => setSecond(e.target.value.slice(0, 2))} // 최대 2자리 제한 추가
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
    </div>
  );
}

export default App;