import React from 'react';
import { CardData } from '../data/data';
import styles from '../styles/Map.module.css';

interface CardProps {
  card: CardData;
}

const CardComponent: React.FC<CardProps> = ({ card }) => {
  if (!card) {
    return null;
  }

  return (
    <div id="cardContainer" className={`${styles.xCard} ${styles.cardContainer}`}>
      <div className="card" style={{ width: '18rem' }}>
        <img className="card-img-top" src={card.imageUrl} alt="Card image" />
        <div className="card-body">
          <h5 className="card-title">{card.title}</h5>
          <p className="card-text">{card.content}</p>
          <a href={card.buttonLink} className="btn btn-primary">
            Learn More
          </a>
        </div>
      </div>
    </div>
    
  );
  
};

export default CardComponent;