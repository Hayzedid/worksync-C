import React from "react";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center rounded-xl bg-white/80 shadow p-6 transition hover:shadow-lg border border-ws-primary">
    <div className="mb-3 text-ws-primary">{icon}</div>
    <h3 className="mb-1 text-lg font-semibold text-ws-dark">{title}</h3>
    <p className="text-sm text-ws-dark text-center">{description}</p>
  </div>
); 