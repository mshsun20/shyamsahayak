import React from 'react'
import './App.css'
import './styles/mardownstyles.css';
import axios from 'axios';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const API_URL = import.meta.env.VITE_APIURL_DEV;


const styledComponent = { /* ============================== HEADINGS ============================== */ h1: ({ children }) => (<h1 className="md-h1"> {children} </h1>), h2: ({ children }) => (<h2 className="md-h2"> {children} </h2>), h3: ({ children }) => (<h3 className="md-h3"> {children} </h3>), /* ============================== PARAGRAPH ============================== */ p: ({ children }) => (<p className="md-paragraph"> {children} </p>), /* ============================== BOLD ============================== */ strong: ({ children }) => (<strong className="md-strong"> {children} </strong>), /* ============================== ITALIC ============================== */ em: ({ children }) => (<em className="md-em"> {children} </em>), /* ============================== UNORDERED LIST ============================== */ ul: ({ children }) => (<ul className="md-ul"> {children} </ul>), /* ============================== ORDERED LIST ============================== */ ol: ({ children }) => (<ol className="md-ol"> {children} </ol>), /* ============================== LIST ITEM ============================== */ li: ({ children }) => (<li className="md-li"> {children} </li>), /* ============================== TABLE ============================== */ table: ({ children }) => (<div className="md-table-wrapper"> <table className="md-table"> {children} </table> </div>), /* ============================== TABLE HEADER ============================== */ thead: ({ children }) => (<thead className="md-thead"> {children} </thead>), /* ============================== TABLE BODY ============================== */ tbody: ({ children }) => (<tbody className="md-tbody"> {children} </tbody>), /* ============================== TABLE ROW ============================== */ tr: ({ children }) => (<tr className="md-tr"> {children} </tr>), /* ============================== TABLE HEADER CELL ============================== */ th: ({ children }) => (<th className="md-th"> {children} </th>), /* ============================== TABLE DATA CELL ============================== */ td: ({ children }) => (<td className="md-td"> {children} </td>), /* ============================== LINKS ============================== */ a: ({ children, href }) => (<a className="md-link" href={href} target="_blank" rel="noopener noreferrer" > {children} </a>), /* ============================== BLOCKQUOTE ============================== */ blockquote: ({ children }) => (<blockquote className="md-blockquote"> {children} </blockquote>), /* ============================== HORIZONTAL RULE ============================== */ hr: () => (<hr className="md-hr" />), /* ============================== INLINE CODE ============================== */ code: ({ children, className, }) => { const isBlockCode = className?.includes("language-"); if (isBlockCode) { return (<code className="md-code-block"> {children} </code>); } return (<code className="md-inline-code"> {children} </code>); }, }

const App = () => {
    const [formData, setFormData] = React.useState({ message: "" });
    const [data, setData] = React.useState(null)
    const handleChange = (e) => {
        console.log(e.target.name);
        console.log(e.target.value);
        const { name, value } = e.target;
        setFormData(p => ({
            ...p, [name]: value
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
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={styledComponent}>{data}</ReactMarkdown>
            </div>
        </div>
    )
}

export default App