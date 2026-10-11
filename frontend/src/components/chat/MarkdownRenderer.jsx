
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({ content = "" }) => {
    return (
        <div className="chat-markdown min-w-0 max-w-full text-sm leading-6 text-gray-800">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold mt-4 mb-2">
                            {children}
                        </h1>
                    ),

                    h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mt-4 mb-2">
                            {children}
                        </h2>
                    ),

                    h3: ({ children }) => (
                        <h3 className="text-base font-semibold mt-3 mb-2">
                            {children}
                        </h3>
                    ),

                    p: ({ children }) => (
                        <p className="wrap-break-word">
                            {children}
                        </p>
                    ),

                    ul: ({ children }) => (
                        <ul className="list-disc pl-6 my-0">
                            {children}
                        </ul>
                    ),

                    ol: ({ children }) => (
                        <ol className="list-decimal pl-6 my-0">
                            {children}
                        </ol>
                    ),

                    li: ({ children }) => (
                        <li className="pl-1">{children}</li>
                    ),

                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                            {children}
                        </strong>
                    ),

                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-orange-400 pl-4 my-3 text-gray-600">
                            {children}
                        </blockquote>
                    ),

                    table: ({ children }) => (
                        <div className="my-4 w-full max-w-full overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full min-w-max border-collapse text-left text-sm">
                                {children}
                            </table>
                        </div>
                    ),

                    thead: ({ children }) => (
                        <thead className="bg-gray-100 text-gray-700">
                            {children}
                        </thead>
                    ),

                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {children}
                        </tbody>
                    ),

                    tr: ({ children }) => (
                        <tr className="even:bg-gray-50 hover:bg-orange-50/60 transition-colors">
                            {children}
                        </tr>
                    ),

                    th: ({ children }) => (
                        <th className="border-b border-gray-200 px-4 py-3 font-semibold whitespace-nowrap">
                            {children}
                        </th>
                    ),

                    td: ({ children }) => (
                        <td className="px-4 py-3 border-b border-gray-100 align-top">
                            {children}
                        </td>
                    ),

                    code: ({ children, className }) => {
                        const isBlock = Boolean(className);

                        return isBlock ? (
                            <code className={`${className} block`}>
                                {children}
                            </code>
                        ) : (
                            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-orange-700 text-xs">
                                {children}
                            </code>
                        );
                    },

                    pre: ({ children }) => (
                        <pre className="my-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100 text-sm">
                            {children}
                        </pre>
                    ),

                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 underline underline-offset-2 break-all"
                        >
                            {children}
                        </a>
                    ),

                    hr: () => (
                        <hr className="my-4 border-gray-200" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default React.memo(MarkdownRenderer);
