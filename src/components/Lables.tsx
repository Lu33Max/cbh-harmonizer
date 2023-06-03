import React from 'react';
import { useDrag } from 'react-dnd';

interface LabelProps {
  label: string;
}

const Label: React.FC<LabelProps> = ({ label }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'label',
    item: { label },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`label ${isDragging ? 'dragging' : ''} w-32 items-center text-2xl bg-gray-300 rounded-xl h-9 mr-2 mb-2`}>
      {label}
    </div>
  );
};

interface LabelsProps {
  labels: string[];
}

const Labels: React.FC<LabelsProps> = ({ labels }) => {
  return (
    <div className="labels flex flex-wrap">
      {labels.map((label, index) => (
        <Label key={index} label={label} />
      ))}
    </div>
  );
};

export default Labels;