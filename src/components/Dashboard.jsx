import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [addingQuiz, setAddingQuiz] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [],
    isPublic:true
  })
  const token = localStorage.getItem("token")
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://quiz-app-backend-1-enh5.onrender.com/dashboard", {
        headers: { token }
      })
      .then((res) => setQuizzes(res.data.dashboardData || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (quizId) => {
    try {
      await axios.delete(
        `https://quiz-app-backend-1-enh5.onrender.com/quiz/${quizId}`,
        { headers: { token } }
      )
      setQuizzes(quizzes.filter((q) => q.quizId !== quizId))
    } catch (err) {
      alert("Error deleting quiz: " + (err.response?.data?.message || err.message))
    }
  }

  const startEdit = (quiz) => {
    setEditingQuiz(quiz)
    setFormData({
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions
    })
  }

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `https://quiz-app-backend-1-enh5.onrender.com/quiz/${editingQuiz.quizId}`,
        formData,
        { headers: { token } }
      )
      setQuizzes(
        quizzes.map((q) =>
          q.quizId === editingQuiz.quizId ? { ...q, ...formData } : q
        )
      )
      setEditingQuiz(null)
    } catch (err) {
      alert("Failed to edit quiz: " + (err.response?.data?.message || err.message))
    }
  }

  const handleAddQuiz = async () => {
    try {
      const res = await axios.post(
        "https://quiz-app-backend-1-enh5.onrender.com/quiz/create",
        formData,
        { headers: { token } }
      )
      setQuizzes([...quizzes, res.data])
      setFormData({ title: "", description: "", questions: [] })
      setAddingQuiz(false)
    } catch (err) {
      alert("Failed to add quiz: " + (err.response?.data?.message || err.message))
    }
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { text: "", options: ["", ""], correctOption: 0 }
      ]
    })
  }

  const removeQuestion = (qIndex) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions.splice(qIndex, 1)
    setFormData({ ...formData, questions: updatedQuestions })
  }

  const updateQuestion = (qIndex, field, value) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[qIndex][field] = value
    setFormData({ ...formData, questions: updatedQuestions })
  }

  const updateOption = (qIndex, oIndex, value) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[qIndex].options[oIndex] = value
    setFormData({ ...formData, questions: updatedQuestions })
  }

  const addOption = (qIndex) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[qIndex].options.push("")
    setFormData({ ...formData, questions: updatedQuestions })
  }

  const removeOption = (qIndex, oIndex) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[qIndex].options.splice(oIndex, 1)
    setFormData({ ...formData, questions: updatedQuestions })
  }

  if (loading) return <p>Loading dashboard...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quiz Dashboard</h1>

      <button
        className="px-3 py-1 mb-4 bg-green-600 text-white rounded"
        onClick={() => setAddingQuiz(true)}
      >
        + Add Quiz
      </button>

      {addingQuiz && (
        <div className="mb-4 p-4 border rounded bg-gray-100">
          <h2 className="font-semibold mb-2">Add New Quiz</h2>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title"
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Description"
            className="w-full p-2 mb-2 border rounded"
          />
          <label className="flex items-center gap-2 mb-2">
              <input
          type="checkbox"
          checked={formData.isPublic}
          onChange={(e) =>
          setFormData({ ...formData, isPublic: e.target.checked })
        }
      />
      Public Quiz
    </label>
          <h3 className="font-semibold">Questions</h3>
          {formData.questions.map((q, qIndex) => (
            <div key={qIndex} className="p-2 mb-2 border rounded bg-white">
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                placeholder="Question text"
                className="w-full p-2 mb-2 border rounded"
              />
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => removeOption(qIndex, oIndex)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded mb-2"
                onClick={() => addOption(qIndex)}
              >
                + Add Option
              </button>
              <label className="block mb-2">
                Correct Answer Index:
                <input
                  type="number"
                  value={q.correctOption}
                  onChange={(e) =>
                    updateQuestion(qIndex, "correctOption", Number(e.target.value))
                  }
                  className="ml-2 w-16 border p-1"
                  min="0"
                  max={q.options.length - 1}
                />
              </label>
              <button
                className="px-2 py-1 bg-red-600 text-white rounded"
                onClick={() => removeQuestion(qIndex)}
              >
                Remove Question
              </button>
            </div>
          ))}

          <button
            className="px-2 py-1 bg-purple-500 text-white rounded mr-2"
            onClick={addQuestion}
          >
            + Add Question
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded mr-2"
            onClick={handleAddQuiz}
          >
            Save Quiz
          </button>
          <button
            className="px-3 py-1 bg-gray-400 text-white rounded"
            onClick={() => setAddingQuiz(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {editingQuiz && (
        <div className="mb-4 p-4 border rounded bg-gray-100">
          <h2 className="font-semibold mb-2">Editing Quiz: {editingQuiz.title}</h2>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title"
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Description"
            className="w-full p-2 mb-2 border rounded"
          />
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={handleEditSubmit}
          >
            Save Changes
          </button>
          <button
            className="px-3 py-1 bg-gray-400 text-white rounded ml-2"
            onClick={() => setEditingQuiz(null)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.quizId}
            className="border rounded p-4 bg-white shadow-md"
          >
            <h2 className="font-semibold">{quiz.title}</h2>
            <p>{quiz.description}</p>
            <p>Questions: {quiz.questionCount}</p>
            <p>
              Total Score: {quiz.totalScore} / {quiz.totalMaxScore}
            </p>

            {String(quiz.owner) ===
              atob(JSON.parse(window.atob(token.split(".")[1])).id) && (
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => startEdit(quiz)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDelete(quiz.quizId)}
                >
                  Delete
                </button>
              </div>
            )}

            <button onClick={() => navigate(`/attempt/${quiz.quizId}`)}>
              Attempt Quiz
            </button>

          </div>
        ))}
      </div>
    </div>
  )
}
