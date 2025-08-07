import React from 'react';

/**
 * Renders text with subscript support.
 * Splits text by underscores to create <sub> tags.
 * @param {{text: string}} props - The component props.
 * @returns {JSX.Element}
 */
const RenderWithSubscript = ({ text }) => {
    const parts = text.split(/(_\w+)/g);
    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('_')) {
                    return <sub key={index}>{part.substring(1)}</sub>;
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </span>
    );
};

export default RenderWithSubscript;
