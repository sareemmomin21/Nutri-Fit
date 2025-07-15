
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function QuestionsPage() {
  const navigate = useNavigate();

 
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [gymMembership, setGymMembership] = useState("");
  const [equipment, setEquipment] = useState("");
  const [focus, setFocus] = useState("");
  const [goals, setGoals] = useState({ gain: false, loss: false, muscle: false, other: false });
  const [otherGoal, setOtherGoal] = useState("");
  const [restrictions, setRestrictions] = useState({ vegetarian: false, vegan: false, glutenFree: false, lactoseIntolerant: false, other: false });
  const [otherRestriction, setOtherRestriction] = useState("");
  const [trainingStyles, setTrainingStyles] = useState({ weightlifting: false, calisthenics: false, hiit: false, cardio: false, other: false });
  const [otherTraining, setOtherTraining] = useState("");

  const handleCheckboxChange = (setter, state, name) => {
    setter({ ...state, [name]: !state[name] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      gender,
      gymMembership,
      equipment: gymMembership === 'yes' ? equipment : '',
      focus,
      goals: Object.keys(goals).filter(k => goals[k]).map(k => k === 'other' ? otherGoal : k),
      restrictions: Object.keys(restrictions).filter(k => restrictions[k]).map(k => k === 'other' ? otherRestriction : k),
      trainingStyles: Object.keys(trainingStyles).filter(k => trainingStyles[k]).map(k => k === 'other' ? otherTraining : k),
    };

    console.log("Questionnaire payload:", payload);
    // TODO: send payload to backend
    navigate("/nutrition");
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h2>NutriFit – Questionnaire</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Age:
          <input type="number" value={age} onChange={e => setAge(e.target.value)} required style={{ marginLeft: '0.5rem', width: '80px' }} />
        </label>
        <br /><br />

        <label>
          Weight (lbs):
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} required style={{ marginLeft: '0.5rem', width: '80px' }} />
        </label>
        <br /><br />

        <label>
          Height (cm):
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} required style={{ marginLeft: '0.5rem', width: '80px' }} />
        </label>
        <br /><br />

        <label>
          Gender:
          <select value={gender} onChange={e => setGender(e.target.value)} required style={{ marginLeft: '0.5rem' }}>
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>
        </label>
        <br /><br />

        <fieldset>
          <legend>Do you have a gym membership or own workout equipment?</legend>
          <label>
            <input type="radio" name="gym" value="yes" checked={gymMembership === 'yes'} onChange={e => setGymMembership(e.target.value)} required /> Yes
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input type="radio" name="gym" value="no" checked={gymMembership === 'no'} onChange={e => setGymMembership(e.target.value)} /> No
          </label>
          {gymMembership === 'yes' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label>
                Equipment:
                <input type="text" value={equipment} onChange={e => setEquipment(e.target.value)} placeholder="e.g. dumbbells" style={{ marginLeft: '0.5rem', width: '60%' }} />
              </label>
            </div>
          )}
        </fieldset>
        <br />

        <fieldset>
          <legend>Would you like to focus on exercise or nutrition?</legend>
          <label>
            <input type="radio" name="focus" value="exercise" checked={focus === 'exercise'} onChange={e => setFocus(e.target.value)} required /> Exercise
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input type="radio" name="focus" value="nutrition" checked={focus === 'nutrition'} onChange={e => setFocus(e.target.value)} /> Nutrition
          </label>
        </fieldset>
        <br />

        <fieldset>
          <legend>What are your goals?</legend>
          <label><input type="checkbox" checked={goals.gain} onChange={() => handleCheckboxChange(setGoals, goals, 'gain')} /> Weight Gain</label><br />
          <label><input type="checkbox" checked={goals.loss} onChange={() => handleCheckboxChange(setGoals, goals, 'loss')} /> Weight Loss</label><br />
          <label><input type="checkbox" checked={goals.muscle} onChange={() => handleCheckboxChange(setGoals, goals, 'muscle')} /> Muscle Building</label><br />
          <label><input type="checkbox" checked={goals.other} onChange={() => handleCheckboxChange(setGoals, goals, 'other')} /> Other</label>
          {goals.other && <input type="text" value={otherGoal} onChange={e => setOtherGoal(e.target.value)} placeholder="Please specify" style={{ marginLeft: '0.5rem', width: '60%' }} />}
        </fieldset>
        <br />

        <fieldset>
          <legend>Dietary restrictions/preferences</legend>
          <label><input type="checkbox" checked={restrictions.vegetarian} onChange={() => handleCheckboxChange(setRestrictions, restrictions, 'vegetarian')} /> Vegetarian</label><br />
          <label><input type="checkbox" checked={restrictions.vegan} onChange={() => handleCheckboxChange(setRestrictions, restrictions, 'vegan')} /> Vegan</label><br />
          <label><input type="checkbox" checked={restrictions.glutenFree} onChange={() => handleCheckboxChange(setRestrictions, restrictions, 'glutenFree')} /> Gluten-Free</label><br />
          <label><input type="checkbox" checked={restrictions.lactoseIntolerant} onChange={() => handleCheckboxChange(setRestrictions, restrictions, 'lactoseIntolerant')} /> Lactose Intolerant</label><br />
          <label><input type="checkbox" checked={restrictions.other} onChange={() => handleCheckboxChange(setRestrictions, restrictions, 'other')} /> Other</label>
          {restrictions.other && <input type="text" value={otherRestriction} onChange={e => setOtherRestriction(e.target.value)} placeholder="Please specify" style={{ marginLeft: '0.5rem', width: '60%' }} />}
        </fieldset>
        <br />

        <fieldset>
          <legend>Training styles interested in</legend>
          <label><input type="checkbox" checked={trainingStyles.weightlifting} onChange={() => handleCheckboxChange(setTrainingStyles, trainingStyles, 'weightlifting')} /> Weightlifting</label><br />
          <label><input type="checkbox" checked={trainingStyles.calisthenics} onChange={() => handleCheckboxChange(setTrainingStyles, trainingStyles, 'calisthenics')} /> Calisthenics</label><br />
          <label><input type="checkbox" checked={trainingStyles.hiit} onChange={() => handleCheckboxChange(setTrainingStyles, trainingStyles, 'hiit')} /> HIIT</label><br />
          <label><input type="checkbox" checked={trainingStyles.cardio} onChange={() => handleCheckboxChange(setTrainingStyles, trainingStyles, 'cardio')} /> Cardio</label><br />
          <label><input type="checkbox" checked={trainingStyles.other} onChange={() => handleCheckboxChange(setTrainingStyles, trainingStyles, 'other')} /> Other</label>
          {trainingStyles.other && <input type="text" value={otherTraining} onChange={e => setOtherTraining(e.target.value)} placeholder="Please specify" style={{ marginLeft: '0.5rem', width: '60%' }} />}
        </fieldset>
        <br />

        <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Submit
        </button>
      </form>
    </div>
  );
}