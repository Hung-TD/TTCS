import React from "react";
import styles from "./header_enter.module.css";

const Header: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>WELCOME</div>
        </div>
    );
};

export default Header;
