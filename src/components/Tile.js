'use client';
import React from 'react';
import * as LucideIcons from 'lucide-react';

const Tile = ({ bg = '#007bff', icon = 'LineChart', color = '#ffffff', size = 32, children }) => {
    // Get the icon component from lucide-react
    const IconComponent = LucideIcons[icon] || LucideIcons.LineChart;
    
    return (
        <div 
            style={{
                backgroundColor: bg,
                color: color,
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80px',
                minWidth: '80px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative'
            }}
        >
            {children || (
                <IconComponent size={size} color={color} />
            )}
        </div>
    );
};

export default Tile;



