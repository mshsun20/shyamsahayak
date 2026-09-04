import React from 'react'
import './App.css'
import axios from 'axios';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const API_URL = import.meta.env.VITE_APIURL_DEV;

const App = () => {
    const [formData, setFormData] = React.useState({ message: "" });
    const [data, setData] = React.useState(null)
    const handleChange = (e) => {
        console.log(e.target.name);
        console.log(e.target.value);
        const { name, value } = e.target;
        setFormData(p => ({
            ...p, [name]:value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);

        try {
            const response = await axios.post(`${API_URL}/chats`, formData);
            console.log(response.data);
            if (response.status === 200) {
                setData(response.data.data.message)
            }
        } catch (error) {
            console.error(error.message);
        }
    }

  return (
    <div className="main-layout">
        <div className="form-section">
            <label htmlFor="message">Message:</label>
            <input type="text" name="message" id="message" value={formData.message} onChange={handleChange} />
            <input type="submit" value="Check" onClick={handleSubmit} />
        </div>
        <div className="data-section">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data}</ReactMarkdown>
        </div>
    </div>
  )
}

export default App