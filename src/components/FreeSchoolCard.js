import React from 'react';
import { Link } from 'react-router-dom';
import freeSchoolsData from '../assets/free-schools.json'; // Убедитесь, что путь правильный

const FreeSchoolCard = ({ title, location, description, Url, img }) => {
    return (
        <div className="card col-12 col-md-10 mb-4 mt-3">
            <div className="row g-0">
                <div className="col-md-4">
                    <img src={img || "/images/free-schools/default.png"} className="img-fluid rounded-start" alt={title} />
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <div className="free-school-city">{location}</div>
                        <h5 className="card-title">{title}</h5>
                        <div className="free-school-description">
                            {description}
                        </div>
                        <p className="card-text mt-2 mb-3">
                            <small className="text-muted">
                                <Link to={Url}>{Url}</Link>
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const FreeSchoolsList = () => {
    return (
        <div className="container-fluid">
            {freeSchoolsData.map(school => (
                <FreeSchoolCard 
                    key={school.id} 
                    title={school.title} 
                    location={school.location} 
                    description={school.description} 
                    Url={school.Url} 
                    img={school.img} 
                />
            ))}
        </div>
    );
}

export default FreeSchoolsList;
