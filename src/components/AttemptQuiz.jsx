import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

export default function AttemptQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const token = localStorage.getItem("token")

  useEffect(() => {
    axios
      .get(`https://quiz-app-backend-1-enh5.onrender.com/quiz/${id}`, {
        headers: { token }
      })
      .then(res => {
        setQuiz(res.data)
        setAnswers(res.data.questions.map(q => ({
          questionId: q._id,
          chosenIndex: null
        })))
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const updateAnswer = (qIndex, selectedIndex) => {
    const updated = [...answers]
    updated[qIndex].chosenIndex = selectedIndex
    setAnswers(updated)
  }

  const handleSubmit = async () => {
    try {
      const incomplete = answers.some(a => a.chosenIndex === null)
      if (incomplete) return alert("Please answer all questions")
      const res = await axios.post(
        `https://quiz-app-backend-1-enh5.onrender.com/quiz/${id}/attempt`,
        { answers },
        { headers: { token } }
      )
      setResult({ score: res.data.score, maxScore: res.data.maxScore })
    } catch (err) {
      console.error(err)
      alert("Failed to submit attempt: " + (err.response?.data?.message || err.message))
    }
  }

  if (loading) return <p>Loading quiz...</p>
  if (!quiz) return <p>Quiz not found</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
      <p className="mb-4">{quiz.description}</p>

      {result ? (
        <div className="p-4 border rounded bg-green-100 mb-4">
          <h2 className="text-xl font-semibold">Result</h2>
          <p className="mt-2">You scored {result.score} / {result.maxScore}</p>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded mt-3"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div>
          {quiz.questions.map((q, idx) => (
            <div key={q._id} className="mb-4 p-4 border rounded bg-gray-50">
              <p className="font-medium mb-2">{q.text}</p>
              {q.options.map((opt, i) => (
                <label key={i} className="block mb-1">
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={i}
                    checked={answers[idx].chosenIndex === i}
                    onChange={() => updateAnswer(idx, i)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}
          <button
            className="px-3 py-1 bg-purple-600 text-white rounded"
            onClick={handleSubmit}
          >
            Submit Attempt
          </button>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded ml-2"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
