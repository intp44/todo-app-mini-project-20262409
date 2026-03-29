require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공!'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// Todo 스키마 정의 (시간과 알람 기능 추가 버전)
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  alarmTime: { type: String }, // 사용자가 설정한 알람 시간 (예: "17:30:00")
  createdAt: { type: Date, default: Date.now } // 데이터 생성 시간 자동 기록
});

const Todo = mongoose.model('Todo', todoSchema);

// API 엔드포인트
// 1. 모든 Todo 가져오기
app.get('/api/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

// 2. 새로운 Todo 추가하기
app.post('/api/todos', async (req, res) => {
  try {
    const { title, alarmTime } = req.body; // 프론트에서 보낸 alarmTime을 받음
    const newTodo = new Todo({
      title,
      alarmTime: alarmTime || null, // 값이 없으면 null로 저장
    });
    const savedTodo = await newTodo.save();
    res.json(savedTodo);
  } catch (err) {
    res.status(500).json({ message: "데이터 저장 실패", error: err });
  }
});

// 3. Todo 완료 상태 변경 (체크박스)
app.put('/api/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(
    req.params.id, 
    { completed: req.body.completed }, 
    { new: true }
  );
  res.json(todo);
});

// 4. Todo 삭제하기
app.delete('/api/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: '삭제 완료' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));