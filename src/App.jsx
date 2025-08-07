// src/App.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ITEM_TYPES } from './utils/constants';
import { generateId } from './utils/helpers';
import Box from './components/Box';
import './App.css';

const App = () => {
  const [items, setItems] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const canvasRef = useRef(null);

  const addItem = (type) => {
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const [width, height] = type == ITEM_TYPES.BUS ? [40, 15] : [60, 30];
    const newItem = {
      id: generateId(),
      type,
      text: type === ITEM_TYPES.TEXT ? 'Text' : type,
      x: canvasBounds.width / 2 - width / 2,
      y: canvasBounds.height / 2 - height / 2,
      width: width,
      height: height,
      rotation: 0,
    };
    setItems(prev => ({ ...prev, [newItem.id]: newItem }));
    setSelectedId(newItem.id);
  };

  const updateItem = (id, updates) => {
    setItems(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], ...updates } };
    });
  };

  const handleTextChange = (id, newText) => {
    updateItem(id, { text: newText });
  };

  const handleCanvasClick = (e) => {
      setSelectedId(null);
      setEditingId(null);
  };

  const handleMouseDown = (e, id, actionType, handleName = null) => {
    e.stopPropagation();
    setSelectedId(id);
    setEditingId(null);
    document.body.style.cursor = getCursorForAction(actionType, handleName);
    setActiveAction({ type: actionType, id, handleName, startX: e.clientX, startY: e.clientY });
  };

  const handleMouseMove = useCallback((e) => {
    if (!activeAction) return;

    const { type, id, startX, startY, handleName } = activeAction;
    const item = items[id];
    if (!item) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    switch (type) {
      case 'move':
        updateItem(id, { x: item.x + dx, y: item.y + dy });
        break;
      case 'resize':
        handleResize(id, dx, dy, handleName);
        break;
      case 'rotate':
        handleRotate(id, e.clientX, e.clientY);
        break;
      default:
        break;
    }

    setActiveAction(prev => ({ ...prev, startX: e.clientX, startY: e.clientY }));
  }, [activeAction, items]);

  const handleMouseUp = useCallback(() => {
    document.body.style.cursor = 'default';
    setActiveAction(null);
  }, []);

  const handleResize = (id, dx, dy, handleName) => {
    const item = items[id];
    let { x, y, width, height } = item;

    if (handleName.includes('e')) width += dx;
    if (handleName.includes('w')) {
      width -= dx;
      x += dx;
    }
    if (handleName.includes('s')) height += dy;
    if (handleName.includes('n')) {
      height -= dy;
      y += dy;
    }

    if (width > 40 && height > 15) {
      updateItem(id, { x, y, width, height });
    }
  };

  const handleRotate = (id, clientX, clientY) => {
    const item = items[id];
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const boxCenterX = canvasRect.left + item.x + item.width / 2;
    const boxCenterY = canvasRect.top + item.y + item.height / 2;
    const angleRad = Math.atan2(clientY - boxCenterY, clientX - boxCenterX);
    const angleDeg = angleRad * (180 / Math.PI) + 90;
    updateItem(id, { rotation: angleDeg });
  };

  const getCursorForAction = (actionType, handleName) => {
    if (actionType === 'move') return 'grabbing';
    if (actionType === 'rotate') return 'crosshair';
    if (actionType === 'resize') return `${handleName}-resize`;
    return 'default';
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleKeyDown = (e) => {
      if (selectedId) {
        if (e.key === 'Delete' || e.key === 'Supr') {
          setItems(prev => {
            const newItems = { ...prev };
            delete newItems[selectedId];
            return newItems;
          });
          setSelectedId(null);
          setEditingId(null);
        }
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
        setEditingId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseMove, handleMouseUp, selectedId]);

  return (
    <div className="app-container">
      <h1 className="app-header">Interactive Canvas</h1>
      <div className="controls-container">
        <button
          onClick={() => addItem(ITEM_TYPES.BUS_STOP)}
          className="control-button btn-bus-stop"
        >
          Add Bus Stop
        </button>
        <button
          onClick={() => addItem(ITEM_TYPES.BUS)}
          className="control-button btn-bus"
        >
          Add Bus
        </button>
        <button
          onClick={() => addItem(ITEM_TYPES.TEXT)}
          className="control-button btn-text"
        >
          Add Text
        </button>
      </div>

      <div
        ref={canvasRef}
        className="canvas-wrapper"
        onClick={handleCanvasClick}
      >
        <div className="canvas-background-circle"></div>
        {Object.values(items).map(item => (
          <Box
            key={item.id}
            {...item}
            onMouseDown={handleMouseDown}
            isSelected={selectedId === item.id}
            isEditing={editingId === item.id}
            onStartEditing={() => {
              setSelectedId(item.id);
              setEditingId(item.id);
            }}
            onTextChange={handleTextChange}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
