import { forwardRef,
         useImperativeHandle,
         memo,
         useRef } from 'react'
import { Link } from 'react-router-dom'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { WithTooltip } from 'atoms/WithTooltip'

import type { ForwardedRef } from 'react'
import type { WidthAwared } from 'typings'

const Gratitude = () => (
    <svg width="66" height="66" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg" className='gratitude-icon'>
        <path className='bindi' d="M31.7682 21.5748C31.4895 21.8974 31.4015 22.1321 31.4749 22.3521C31.7975 23.5108 33.7335 23.3934 33.7335 22.2201C33.7335 21.7068 33.1175 21.1201 32.5749 21.1201C32.2815 21.1201 32.0322 21.2521 31.7682 21.5748Z"/>
        <path className='eyebrows' d="M42.1225 25.3736C40.7439 26.0922 38.8372 26.6936 37.4439 26.8549C35.9185 27.0162 35.7865 27.0749 35.7865 27.5589C35.7865 28.1602 36.0359 28.3069 37.1065 28.3069C38.9985 28.3069 41.1105 27.4416 42.6212 26.0629C43.5012 25.2562 43.7945 24.7722 43.3839 24.8016C43.2812 24.8016 42.7092 25.0656 42.1225 25.3736ZM22.8799 25.3589C22.8799 25.8282 25.4025 27.3389 27.1772 27.9256C28.6732 28.4242 29.4359 28.4389 29.6559 27.9549C30.0079 27.1629 29.7439 27.0162 27.0305 26.4736C25.9452 26.2536 24.7719 25.9162 24.2292 25.6669C23.2612 25.2122 22.8799 25.1242 22.8799 25.3589Z"/>
        <path className='main' d="M42.768 28.0867C41.0667 30.668 39.8933 31.152 37.0773 30.4333C36.7547 30.3453 36.6667 30.3747 36.6667 30.5507C36.6667 31.0493 38.368 31.9733 39.292 31.9733C40.8027 31.9733 42.24 30.932 43.032 29.2893C43.9267 27.456 43.736 26.6347 42.768 28.0867ZM66 33C66 51.2254 51.2254 66 33 66C14.7746 66 1.96695e-06 51.2254 1.96695e-06 33C1.96695e-06 14.7746 14.7746 6.71387e-06 33 6.71387e-06C51.2254 6.71387e-06 66 14.7746 66 33ZM25.4613 2.992C26.7667 2.376 27.632 2.08267 28.8933 1.81867C28.8933 1.81867 30.6779 1.4275 30.7267 1.40801C30.9173 1.33467 29.6853 1.33467 29.1867 1.42267C27.5 1.672 25.872 1.98001 25.0067 2.20001C16.8373 4.35601 10.0613 9.504 5.72 16.8667C3.66667 20.372 2.40533 23.9653 1.81867 28.0867C1.46667 30.5507 1.452 35.024 1.804 37.18C2.88933 43.78 5.764 49.6027 10.2667 54.3253C11.7187 55.836 15.1947 58.6667 15.6053 58.6667C15.6933 58.6667 16.06 58.4027 16.4267 58.08C16.7933 57.7573 17.3947 57.244 17.776 56.936C18.1573 56.6427 18.4653 56.32 18.48 56.232C18.48 56.144 18.392 55.8067 18.2747 55.484C18.084 54.9267 18.084 54.8973 18.612 54.12C19.624 52.6093 21.0173 52.0813 23.0707 52.4333L23.7747 52.5507L24.5813 51.7587C25.2474 51.1078 25.5697 50.7928 25.506 50.6504C25.4463 50.5169 25.047 50.5352 24.2733 50.5707C22.6307 50.644 21.3693 50.3213 19.6533 49.3827C17.9373 48.444 15.8425 46.1853 14.52 42.284C13.42 39.039 13.7427 30.976 14.52 23.2467C14.5787 22.6747 14.7693 21.428 14.9453 20.46C15.136 19.492 15.2973 18.4947 15.3267 18.2307C15.356 17.9667 15.5173 17.2187 15.6933 16.544C15.8342 16.0041 15.9938 15.3985 16.0895 15.0353C16.1134 14.9446 16.0749 15.091 16.0895 15.0353C16.0895 15.0353 17.4973 11.0293 18.2013 9.68001C18.964 8.25734 20.108 6.82001 21.2667 5.77867C21.6333 5.47067 21.956 5.17734 22 5.13334C22.528 4.59067 24.0533 3.652 25.4613 2.992ZM55.1467 10.648C50.3653 5.72001 44 2.49333 37.2093 1.54C36.344 1.42267 35.5227 1.32 35.376 1.33467C34.892 1.34934 35.684 1.59867 36.2707 1.59867C37.9427 1.62801 42.196 3.32934 44.0733 4.70801C47.6373 7.33334 50.0427 12.0267 50.9667 18.1867C51.48 21.5747 51.5387 24.1707 51.3773 35.4933C51.304 39.5707 51.4653 41.932 51.8613 43.252C51.964 43.6187 52.0227 43.956 51.9787 44.0293C51.8613 44.22 49.544 44.0147 49.324 43.7947C49.192 43.6773 49.2067 43.2227 49.3533 41.8733C49.6907 38.7347 49.9547 25.1973 49.72 22.5133C49.3973 18.6853 48.532 15.5027 46.9627 12.3493C44.88 8.16934 42.3133 5.412 38.9253 3.696C34.496 1.452 29.0987 2.05334 24.4933 5.29467C23.4373 6.04267 20.68 8.668 20.68 8.932C20.68 8.99067 20.4747 9.31333 20.2253 9.62133C19.228 10.8533 17.7027 14.4907 17.3507 16.4853C17.204 17.248 17.6293 16.8373 18.0547 15.7813C19.5653 12.0707 21.5453 9.328 24.1707 7.37734C25.564 6.336 26.829 5.53666 28.6 5.13334C30.5306 4.69365 32.472 3.52001 32.6773 3.52001C32.78 3.52001 33.3373 3.784 33.8947 4.10667C34.452 4.444 35.4053 4.84 36.036 4.98667C36.6667 5.148 37.6493 5.51467 38.236 5.79334C40.4507 6.87867 43.56 9.724 44.4987 11.5427C44.9973 12.5253 44.7627 12.4227 42.6507 10.736C39.4533 8.184 36.3147 6.58533 34.0707 6.35067L33.1467 6.26267V10.4427C33.1467 15.1653 33.1907 15.444 34.188 16.6467C35.3027 18.0107 36.8427 18.6707 39.2333 18.832C40.4067 18.92 40.7 18.9933 41.9027 19.5947C42.9733 20.1227 43.4427 20.46 44.1467 21.2227C44.6453 21.7507 45.188 22.4693 45.364 22.8213C45.6573 23.4373 45.98 23.6133 46.288 23.3347C46.3613 23.2613 46.5667 23.1587 46.7427 23.1147C47.0213 23.0267 47.1387 23.1293 47.5053 23.716C47.7547 24.0973 47.96 24.5373 47.96 24.6987C47.96 24.8453 47.6813 25.2413 47.344 25.5787L46.728 26.18L46.7133 28.028C46.684 29.2453 46.5667 30.4187 46.3467 31.5187L46.024 33.1613L46.552 34.1733C47.7253 36.388 48.18 38.28 47.8133 39.3947C47.5493 40.2013 47.0067 40.8907 46.4053 41.14C45.7893 41.3893 45.7453 41.5653 46.3467 41.4333C46.684 41.36 46.86 41.4187 47.1533 41.712C47.3587 41.9173 47.52 42.1667 47.52 42.284C47.52 42.592 46.9627 43.12 46.64 43.12C46.42 43.12 46.3467 43.2227 46.3467 43.4867C46.3467 44 45.7307 44.5867 45.2027 44.5867C44.6893 44.5867 44.1467 44.0587 44.1467 43.5453C44.1467 43.296 44.0147 43.1347 43.6627 42.9733C42.724 42.5333 43.076 41.58 44.22 41.4773L44.8067 41.4333L44.1907 41.1107C43.8533 40.92 43.384 40.5387 43.164 40.26C42.944 39.9813 42.7093 39.7467 42.6507 39.7467C42.6067 39.7467 41.844 40.4653 40.964 41.3453L39.3653 42.9587L39.1747 44.176C39.072 44.8507 38.9253 45.7453 38.8373 46.1853C38.676 47.0947 38.764 47.212 39.6 47.2267C40.084 47.2413 41.2573 47.4907 42.0933 47.7693C43.472 48.224 45.5693 49.6613 47.2853 51.304C48.6347 52.6093 50.1013 55.4547 50.5267 57.596C50.5853 57.86 50.6733 58.1093 50.7467 58.1533C51.0547 58.344 55.3667 54.4427 56.9213 52.58C59.9427 48.9133 61.9373 45.012 63.1253 40.4653C63.8293 37.796 64.0933 35.6547 64.0933 32.8093C64.0933 27.632 63.1253 23.32 60.9547 18.876C59.4 15.6787 57.7427 13.3173 55.1467 10.648ZM31.2253 16.94C32.0613 15.7227 32.12 15.2973 32.12 10.604V6.30667L31.5773 6.32133C29.7733 6.39467 28.38 6.77601 26.5613 7.70001C23.672 9.15201 21.3987 11.616 19.9027 14.8867C18.656 17.6293 18.2453 19.888 18.3773 23.4227C18.4947 26.532 18.8027 28.0427 19.8293 30.2427L20.4307 31.504L20.0933 32.032C19.712 32.6627 19.4773 32.692 19.096 32.1493C18.172 30.844 17.1893 27.412 16.94 24.4933C16.8813 23.892 16.8227 23.3787 16.7933 23.3493C16.764 23.32 16.6467 23.6133 16.5147 24.0093C15.972 25.6813 15.6048 29.9069 15.455 33.165C15.3052 36.4231 15.4468 39.7953 16.115 41.8C17.1829 45.0037 18.425 47.41 21.692 48.8987C22.66 49.28 26.092 49.192 26.5027 48.7813C26.5467 48.7373 26.4147 47.9307 26.1947 46.9773C25.7107 44.7773 25.5347 43.56 25.5053 42.372C25.4907 41.4627 25.4613 41.404 24.6693 40.436C23.716 39.2627 23.6427 39.204 23.5107 39.556C23.3347 40.0693 22.704 40.788 22.2493 40.9933L21.78 41.2133L22.264 41.1253C22.924 41.008 23.4667 41.3747 23.4667 41.9467C23.4667 42.4013 23.0267 42.8267 22.5573 42.8267C22.352 42.8267 22.2933 42.944 22.2933 43.3253C22.2933 43.9707 21.9707 44.22 21.1493 44.2053C20.416 44.1907 20.0933 43.912 20.0933 43.2813C20.0933 43.0027 19.9613 42.8413 19.6093 42.68C19.2427 42.504 19.1253 42.3573 19.096 41.9907C19.0373 41.36 19.5507 41.008 20.2987 41.1547C20.592 41.1987 20.8267 41.2133 20.8267 41.1693C20.8267 41.1107 20.5187 40.876 20.152 40.612C19.2573 39.996 18.9347 39.2627 18.92 37.884C18.92 36.3587 19.3307 35.3467 20.3573 34.364L21.164 33.5867L20.988 32.736C20.8853 32.2813 20.768 31.0933 20.724 30.096C20.6507 28.4827 20.6653 28.3067 20.8853 28.3067H20.8928C20.9555 28.3066 21.0038 28.3066 21.0443 28.3244C21.1812 28.3845 21.2288 28.6479 21.4371 29.8003L21.4545 29.8964L21.472 29.9933C22.044 33.0733 22.704 35.1267 23.672 36.8573C24.288 37.972 25.4613 39.4533 25.7107 39.4533C25.8133 39.4533 26.0773 38.9693 26.312 38.3827C26.5467 37.8107 27.1333 36.4027 27.6173 35.2733C27.6925 35.0925 27.7688 34.909 27.8445 34.7268C28.2417 33.7716 28.6235 32.8533 28.7467 32.5453L29.0253 31.856L27.7933 31.9293C26.7373 32.0027 26.488 31.9733 25.9013 31.68C25.0653 31.284 24.3027 30.4187 23.7453 29.26C23.012 27.72 23.32 27.368 24.332 28.5853C25.08 29.48 26.3267 30.3453 27.1187 30.5213C27.8373 30.6827 28.908 30.4773 29.48 30.0667C29.7587 29.876 30.0813 29.304 30.5067 28.2773C31.416 26.0627 31.6213 25.7693 32.1787 25.8573C32.428 25.8867 32.736 25.872 32.868 25.7987C33.264 25.5933 33.7333 26.0773 34.2467 27.192C34.9947 28.8493 35.5227 29.964 36.8867 32.78C38.2067 35.508 39.2187 38.3093 39.3947 39.644C39.5413 40.8173 39.6147 40.876 40.2453 40.3187C41.228 39.4533 42.68 37.444 43.472 35.8307C44.4107 33.9387 44.9387 32.2667 45.2467 30.2427C45.7893 26.6053 45.3053 24.508 43.5013 22.616C42.1667 21.208 40.7587 20.592 38.368 20.3867C36.608 20.2253 35.9333 20.02 34.804 19.2427C33.7773 18.5387 33.572 18.3187 33.0293 17.3213L32.604 16.5587L32.12 17.5413C31.548 18.7147 30.0813 20.2693 29.172 20.6653C28.82 20.8267 28.028 21.0173 27.412 21.1053C25.5493 21.3547 24.1707 21.912 23.1733 22.836L23.1639 22.8443C22.6012 23.3348 22.5867 23.3475 22.5867 23.012C22.5867 22.2787 23.6427 21.032 24.8453 20.328C25.5787 19.9027 26.5173 19.5947 27.544 19.448C28.8787 19.2573 30.3453 18.26 31.2253 16.94ZM36.08 33.9533C36.08 33.88 35.552 32.6333 34.9067 31.1813C34.2613 29.7147 33.6013 28.3653 33.44 28.16L33.1467 27.7933V28.776C33.1467 29.612 33.1907 29.7733 33.4253 29.8467C33.7773 29.9493 34.0413 30.36 35.024 32.2667C35.772 33.748 36.08 34.232 36.08 33.9533ZM31.7533 29.92C32.0907 29.788 32.12 29.7 32.12 28.8933C32.12 28.4093 32.0907 28.0133 32.0467 28.0133C31.9733 28.0133 31.9147 28.1453 31.02 30.2133C30.9357 30.4053 30.7887 30.7451 30.6004 31.1804L30.5997 31.1821L30.5993 31.1829C30.1977 32.1114 29.6087 33.473 29.04 34.76C28.9669 34.9279 28.8961 35.0902 28.8277 35.2473C27.3122 38.7248 26.9252 39.6129 26.8223 40.5328C26.787 40.8484 26.7852 41.1676 26.7826 41.5964L26.7821 41.6863C26.7819 41.7234 26.7816 41.7613 26.7813 41.8C26.7813 43.2227 26.884 43.956 27.3973 46.4347C27.7347 48.0627 28.0133 49.544 28.0133 49.7347C28.0133 49.984 27.3093 50.7907 25.344 52.756L22.6893 55.4107L22.8653 55.8653C22.968 56.1147 23.276 56.4813 23.5547 56.6867C24.3027 57.2587 25.6373 57.8307 26.004 57.728C26.356 57.64 29.7733 54.208 30.712 53.02C31.02 52.6093 31.46 51.876 31.6947 51.3627L32.12 50.4387L32.076 40.9787C32.0613 35.7867 31.988 31.5187 31.9147 31.504C31.724 31.4453 31.1227 33.1613 30.5213 35.4933L30.5213 35.4935C30.0928 37.1287 29.9937 37.5065 29.7775 37.5938C29.7125 37.62 29.6369 37.62 29.5387 37.62C29.128 37.62 29.1133 37.6053 29.1427 36.8867C29.172 36.1533 29.612 34.6573 30.5067 32.2667C31.2107 30.3453 31.3573 30.0667 31.7533 29.92ZM37.6787 45.3053C38.3387 41.2427 38.2507 40.172 37.048 37.928C36.8085 37.4698 36.2733 36.472 35.7048 35.412C35.4725 34.9791 35.2348 34.5358 35.0093 34.1147C33.4991 31.312 33.4985 31.313 33.399 31.4842L33.396 31.4893C33.352 31.548 33.7187 32.5013 34.2027 33.5867C35.068 35.5373 35.596 37.356 35.4347 37.7813C35.376 37.928 35.2 37.9867 34.9507 37.9573C34.5693 37.9133 34.5253 37.8253 34.2173 36.6373C34.0413 35.9333 33.748 35.0387 33.5573 34.6573L33.22 33.9533L33.176 41.7267C33.1467 48.224 33.176 49.6027 33.3667 50.2333C33.6453 51.216 34.6867 52.932 35.7427 54.1933C36.828 55.484 39.732 58.08 40.084 58.08C40.216 58.08 40.7293 57.8893 41.1987 57.6547C42.548 56.9653 43.8533 55.308 43.5893 54.5893C43.5013 54.34 40.3333 52.14 39.512 51.744C37.6787 50.8933 37.092 48.84 37.6787 45.3053ZM46.4493 38.0747C46.3907 37.268 46.2293 36.5347 45.98 35.8893C45.76 35.3467 45.5253 34.9067 45.452 34.9067C45.3787 34.9067 45.2907 35.0827 45.232 35.3027C45.188 35.5373 44.8067 36.388 44.4107 37.2093C43.868 38.3533 43.7213 38.764 43.8387 38.9693C44.1027 39.468 44.6893 39.908 45.2173 39.996C45.6573 40.0547 45.804 40.0107 46.1413 39.6733C46.5227 39.292 46.5373 39.248 46.4493 38.0747ZM22.616 37.4733C22.44 37.1507 22.1613 36.52 21.9853 36.08C21.8093 35.64 21.6187 35.2293 21.56 35.1707C21.3987 34.9653 20.8267 35.5227 20.4453 36.256C20.1227 36.8867 20.0787 37.1653 20.1227 37.8693C20.196 38.9107 20.5773 39.4827 21.2813 39.6293C21.9267 39.7613 22.44 39.4093 22.704 38.632C22.88 38.1187 22.88 38.0013 22.616 37.4733ZM47.2707 53.7093C45.8773 51.568 44 49.8667 42.1373 49.06C41.5067 48.796 40.6267 48.532 40.172 48.4733C39.4387 48.3853 39.292 48.4147 39.028 48.6787C38.852 48.8547 38.72 49.0453 38.72 49.1187C38.72 49.4267 39.556 50.2187 40.8907 51.1427C41.668 51.6853 42.636 52.3747 43.0173 52.6827C43.7067 53.2107 43.7653 53.24 44.528 53.152C45.2173 53.064 45.3933 53.0933 45.892 53.4307C46.6107 53.9 47.2413 54.824 47.5933 55.8507C47.7253 56.276 48.004 56.804 48.2093 57.024C48.4147 57.244 48.7373 57.6107 48.928 57.86C49.2507 58.256 49.28 58.2707 49.28 57.992C49.28 57.5667 47.9747 54.78 47.2707 53.7093ZM36.3147 56.8333C35.9627 56.584 34.7893 55.1173 33.7333 53.5773C33.3373 53.0053 32.9413 52.492 32.868 52.448C32.736 52.36 31.284 54.0613 30.7707 54.8827C30.4773 55.3373 29.9493 55.968 28.8347 57.1707C28.6257 57.3941 28.5194 57.5077 28.4949 57.6369C28.4695 57.7705 28.5319 57.9208 28.6587 58.2267C29.084 59.2973 28.8787 60.6027 28.1747 61.2627L27.8813 61.5413L28.2333 62.5533C28.556 63.4773 28.6293 63.5947 29.0547 63.668C29.9787 63.8587 33.0293 63.976 34.4667 63.8733L35.9333 63.7707L36.3 63.008C36.5053 62.5827 36.9307 61.864 37.2533 61.3947L37.84 60.544L37.488 60.1187C37.268 59.8547 37.092 59.4147 37.0333 58.9893C36.8867 57.7867 36.6373 57.0533 36.3147 56.8333ZM24.0973 58.344C22.572 57.4933 21.1493 55.264 21.3253 54.0173C21.3987 53.4893 21.3693 53.3867 21.1493 53.3867C20.7973 53.3867 19.9907 53.9 19.8147 54.252C19.3013 55.1907 20.02 56.98 21.5013 58.4907C22.6453 59.6347 23.496 60.1187 25.036 60.4853C26.0627 60.7347 26.1213 60.72 26.7227 60.456C27.148 60.28 27.4413 60.0013 27.6467 59.6493C28.028 58.9307 27.8667 58.7987 26.7813 58.9747C25.7987 59.136 25.3 59.0187 24.0973 58.344ZM44.0147 57.9333C44.7333 57.1707 45.012 56.584 45.1147 55.528C45.2027 54.648 44.968 54.2813 44.8213 55.0587C44.6893 55.7773 43.7213 57.1853 42.8853 57.8893C42.064 58.564 41.272 58.9747 39.9227 59.356L38.9987 59.6347L39.4387 60.2507C39.688 60.588 40.084 60.9547 40.3187 61.0867C40.8467 61.3507 42.416 61.38 43.1347 61.1307C43.7067 60.94 44.7773 60.2507 45.3493 59.708C45.8333 59.224 46.4933 57.992 46.4933 57.552C46.4933 57.376 46.552 57.0533 46.64 56.848C46.728 56.5987 46.728 56.3347 46.6253 56.0707C46.464 55.6307 46.332 55.7187 46.0533 56.4667C45.7453 57.288 45.3493 57.7573 44.5427 58.3C43.296 59.136 43.0467 58.96 44.0147 57.9333ZM22.572 60.7933C21.9853 60.5147 21.2667 59.9867 20.5627 59.2973C19.9613 58.7107 19.448 58.2267 19.4187 58.2267C19.3307 58.2267 17.5267 59.7227 17.4827 59.84C17.424 59.9867 20.328 61.4093 21.6773 61.8933L22.6013 62.2307L23.0267 61.82C23.276 61.5853 23.4667 61.3653 23.4667 61.3067C23.4667 61.2627 23.056 61.028 22.572 60.7933ZM48.9867 59.3853C48.9867 59.3267 48.708 59.0333 48.3707 58.7547C48.0333 58.4613 47.7253 58.2267 47.6667 58.2267C47.6227 58.2267 47.432 58.52 47.2707 58.872C47.0947 59.2093 46.5813 59.9133 46.1267 60.412C45.6573 60.896 45.3347 61.3067 45.3933 61.3067C45.5987 61.3067 48.9867 59.488 48.9867 59.3853ZM24.728 62.8173C24.9187 63.008 25.3587 62.92 25.4907 62.656C25.564 62.524 25.5933 62.304 25.5347 62.172C25.4613 61.9667 25.388 61.996 25.036 62.3187C24.816 62.5387 24.6693 62.7587 24.728 62.8173ZM26.9133 63.316C27.2507 63.4333 27.2947 63.3307 27.104 62.7293C26.8987 62.04 26.6933 62.0253 26.6933 62.7C26.6933 63.0373 26.7813 63.2573 26.9133 63.316ZM40.2307 63.008C40.92 62.8907 41.3307 62.6267 40.8027 62.6267C40.612 62.6267 40.2747 62.524 40.04 62.4067L39.6 62.172V62.6413C39.6 62.8532 39.6 62.9694 39.658 63.0237C39.7285 63.0898 39.8847 63.0643 40.2307 63.008ZM37.928 63.4773C38.0747 63.448 38.192 63.272 38.2213 63.0227C38.2653 62.5093 38.192 62.524 37.9133 63.0813C37.6933 63.5067 37.6933 63.536 37.928 63.4773Z"/>
    </svg>
);

const NewWishButton = memo(() => {
    return (
        <Link
            to='/my-wishes/items/new'
            className='icon-link'
            children={ <Icon name='newWish'/> }
        />
    )
});

const NewWishlistButton = memo(() => (
    <Link
        to='/my-wishes/lists/new'
        className='icon-link'
        children={ <Icon name='newList'/> }
    />
));


export const CreationGroup = forwardRef((
    _props,
    ref: ForwardedRef<WidthAwared>
) => {
    const creationGroupRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getWidth: () => creationGroupRef.current?.offsetWidth
    }));

    return (
        <div
            className='creation-group'
            ref={ creationGroupRef }
        >
            {/* <WithTooltip
                trigger={ <Gratitude/> }
                text='Благодарность разработчику'
            /> */}
            <Gratitude/>
            <WithTooltip
                trigger={ <NewWishButton/> }
                text='Новое желание'
            />
            <WithTooltip
                trigger={ <NewWishlistButton/> }
                text='Новый вишлист'
            />
        </div>
    )
})
