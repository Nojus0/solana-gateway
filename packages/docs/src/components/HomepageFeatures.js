import React from "react";
import clsx from "clsx";
import styles from "./HomepageFeatures.module.css";

const FeatureList = [
  {
    title: "Easy integration",
    description: <>Easily integrate solana into your project with ease.</>,
  },
  {
    title: "Payments",
    description: (
      <>
        Accept solana payments by requesting a deposit address and sending funds
        to it
      </>
    ),
  },
  {
    title: "Transactions",
    description: (
      <>
        Track and monitor your transactions by using the transaction explorer.
      </>
    ),
  },
];

function Feature({ title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
