interface WelcomeStepProps {
  description: string;
  heading: string;
  number: number;
  steps?: string[];
}

export function WelcomeStep({
  description,
  heading,
  number,
  steps,
}: WelcomeStepProps) {
  return (
    <div className="text-left welcomeStep">
      <div className="flexRow">
        <h2 className="stepNumber">{number}</h2>
        <div>
          <h3>{heading}</h3>
          <p>{description}</p>
        </div>
      </div>
      <ul>
        {steps?.map((step, index) => (
          <li key={index} className="step">
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
