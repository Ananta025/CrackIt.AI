import React from 'react'
import styles from './AboutUs.module.css'

export default function AboutUs() {
  return (
    <div className={styles['about-us']}>
        <div className={styles.text}>
            <p className={styles.heading}>About Us</p>
            <p className={styles['body-text']}>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Obcaecati omnis accusamus nisi numquam laborum. Libero necessitatibus omnis optio eligendi, veritatis animi quasi maiores iure tempore temporibus labore totam officiis enim.
                <br/><br/>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere quia asperiores libero quisquam adipisci consectetur error odit magnam quaerat tempore similique atque blanditiis sapiente dolor repudiandae, nam corporis in consequatur.
            </p>
        </div>
    </div>
  )
}
