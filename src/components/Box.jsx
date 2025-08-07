// src/components/Box.jsx
import React, { useRef, useEffect } from 'react';
import { ITEM_TYPES, IMAGE_URLS } from '../utils/constants';
import RenderWithSubscript from './RenderWithSubscript';
import './Box.css';

const Box = ({ id, type, x, y, width, height, rotation, text, onMouseDown, isSelected, isEditing, onStartEditing, onTextChange }) => {
    const textRef = useRef(null);

    const wrapperStyle = {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation}deg)`,
        cursor: 'grab',
    };

    const visualBoxStyle = {
        backgroundImage: type === ITEM_TYPES.BUS ? `url(${IMAGE_URLS[type]})` : 'none',
        backgroundColor: type === ITEM_TYPES.TEXT ? 'transparent' : '',
    };

    useEffect(() => {
        if (isEditing && textRef.current) {
            textRef.current.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(textRef.current);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, [isEditing]);

    const isImageType = type === ITEM_TYPES.BUS || type === ITEM_TYPES.BUS_STOP;

    // Helper to combine class names
    const classNames = (...classes) => classes.filter(Boolean).join(' ');

    return (
        <div
            style={wrapperStyle}
            onMouseDown={(e) => onMouseDown(e, id, 'move')}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                style={visualBoxStyle}
                className={classNames(
                    'visual-box',
                    isImageType ? 'visual-box-image' : 'visual-box-text',
                    !isImageType && isSelected && 'selected'
                )}
                onDoubleClick={onStartEditing}
            >
                {!isImageType && (
                    <div
                        ref={textRef}
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onTextChange(id, e.currentTarget.textContent)}
                        className={classNames(
                            'text-label',
                            'text-label-text-box',
                            isEditing && 'editing-text-box'
                        )}
                        style={{ pointerEvents: isEditing ? 'auto' : 'none' }}
                    >
                        {isEditing ? text : <RenderWithSubscript text={text} />}
                    </div>
                )}
            </div>

            {isImageType && (
                <div
                    ref={textRef}
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onTextChange(id, e.currentTarget.textContent)}
                    onDoubleClick={(e) => { e.stopPropagation(); onStartEditing(); }}
                    className={classNames(
                        'text-label',
                        'text-label-image',
                        isEditing && 'editing'
                    )}
                    style={{ pointerEvents: isEditing ? 'auto' : 'none' }}
                >
                    {isEditing ? text : <RenderWithSubscript text={text} />}
                </div>
            )}

            {isSelected && (
                <>
                    {[
                        { name: 'n', style: { top: -5, left: '50%', transform: 'translateX(-50%)' } },
                        { name: 's', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)' } },
                        { name: 'e', style: { top: '50%', right: -5, transform: 'translateY(-50%)' } },
                        { name: 'w', style: { top: '50%', left: -5, transform: 'translateY(-50%)' } },
                        { name: 'nw', style: { top: -5, left: -5 } },
                        { name: 'ne', style: { top: -5, right: -5 } },
                        { name: 'sw', style: { bottom: -5, left: -5 } },
                        { name: 'se', style: { bottom: -5, right: -5 } },
                    ].map(handle => (
                        <div
                            key={handle.name}
                            style={{ ...handle.style, cursor: `${handle.name}-resize` }}
                            className="resize-handle"
                            onMouseDown={(e) => onMouseDown(e, id, 'resize', handle.name)}
                        />
                    ))}
                    <div
                        className="rotate-handle"
                        onMouseDown={(e) => onMouseDown(e, id, 'rotate')}
                    >
                        <div className="rotate-handle-line"></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Box;
