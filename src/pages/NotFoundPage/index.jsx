import React from 'react'
import { Link } from 'react-router-dom'

export const NotFoundPage = () => {
    return (
        <div className='not-found-page'>
            Sorry, this page does not exist. Please,
            <Link
                to='/my-wishes/items/actual'
            >
                go home page
            </Link>
        </div>
    );
}