import React, { useEffect, useState } from 'react';

const About = () => {

  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetch("/api/team")
      .then(res => res.json())
      .then(data => setTeamMembers(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About HarshiCart</h1>
        <p>Your trusted online shopping destination since 2020</p>
      </section>

      <section className="about-content">

        <div className="team-section">
          <h2>Meet Our Team</h2>

          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member._id} className="team-member">
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>

        </div>

      </section>
    </div>
  );
};

export default About;