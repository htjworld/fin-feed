-- RSS URL 수정 및 로고 URL 추가 마이그레이션
-- Supabase SQL Editor에서 실행

ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

UPDATE companies SET rss_url = 'https://tech.kakaopay.com/rss.xml',  logo_url = 'https://www.google.com/s2/favicons?domain=kakaopay.com&sz=64'  WHERE name_en = 'KakaoPay';
UPDATE companies SET rss_url = 'https://medium.com/feed/naverfinancial', site_url = 'https://medium.com/naverfinancial', logo_url = 'https://www.google.com/s2/favicons?domain=pay.naver.com&sz=64' WHERE name_en = 'NaverPay';
UPDATE companies SET rss_url = 'https://blog.banksalad.com/rss.xml',  logo_url = 'https://www.google.com/s2/favicons?domain=banksalad.com&sz=64' WHERE name_en = 'Banksalad';
UPDATE companies SET rss_url = 'https://tech.kakaobank.com/index.xml', logo_url = 'https://www.google.com/s2/favicons?domain=kakaobank.com&sz=64' WHERE name_en = 'KakaoBank';
UPDATE companies SET rss_url = 'https://medium.com/feed/kbanktech',   logo_url = 'https://www.google.com/s2/favicons?domain=kbanknow.com&sz=64'  WHERE name_en = 'K Bank';
UPDATE companies SET rss_url = NULL,                                   logo_url = 'https://www.google.com/s2/favicons?domain=kbds.co.kr&sz=64'   WHERE name_en = 'KBDS';
UPDATE companies SET logo_url = 'https://www.google.com/s2/favicons?domain=shinhands.co.kr&sz=64'        WHERE name_en = 'Shinhan DS';
UPDATE companies SET logo_url = 'https://www.google.com/s2/favicons?domain=hit.hanati.co.kr&sz=64'       WHERE name_en = 'Hana Tech';
UPDATE companies SET logo_url = 'https://www.google.com/s2/favicons?domain=miraeasset.com&sz=64'         WHERE name_en = 'Mirae Asset';
UPDATE companies SET logo_url = 'https://www.google.com/s2/favicons?domain=kiwoom.com&sz=64'             WHERE name_en = 'Kiwoom';
UPDATE companies SET site_url = 'https://apiportal.koreainvestment.com', logo_url = 'https://www.google.com/s2/favicons?domain=koreainvestment.com&sz=64' WHERE name_en = 'KIS';
UPDATE companies SET rss_url = NULL, site_url = 'https://dunamu.com', logo_url = 'https://www.google.com/s2/favicons?domain=dunamu.com&sz=64'     WHERE name_en = 'Dunamu';
UPDATE companies SET rss_url = NULL, site_url = 'https://upbit.com',  logo_url = 'https://www.google.com/s2/favicons?domain=upbit.com&sz=64'      WHERE name_en = 'Upbit';
UPDATE companies SET logo_url = 'https://www.google.com/s2/favicons?domain=bithumb.com&sz=64'            WHERE name_en = 'Bithumb';
UPDATE companies SET logo_url = 'https://www.google.com/s2/favicons?domain=coinone.co.kr&sz=64'          WHERE name_en = 'Coinone';
UPDATE companies SET rss_url = 'https://blog.kaia.io/feed/', site_url = 'https://blog.kaia.io', logo_url = 'https://www.google.com/s2/favicons?domain=kaia.io&sz=64' WHERE name_en = 'Klaytn';
UPDATE companies SET rss_url = 'https://stripe.com/blog/feed.rss',    logo_url = 'https://www.google.com/s2/favicons?domain=stripe.com&sz=64'    WHERE name_en = 'Stripe';
UPDATE companies SET logo_url = 'https://www.google.com/s2/favicons?domain=plaid.com&sz=64'              WHERE name_en = 'Plaid';
UPDATE companies SET rss_url = NULL, logo_url = 'https://www.google.com/s2/favicons?domain=robinhood.com&sz=64' WHERE name_en = 'Robinhood';
UPDATE companies SET rss_url = NULL, site_url = 'https://monzo.com/blog/technology', logo_url = 'https://www.google.com/s2/favicons?domain=monzo.com&sz=64' WHERE name_en = 'Monzo';
UPDATE companies SET logo_url = 'https://www.google.com/s2/favicons?domain=revolut.com&sz=64'            WHERE name_en = 'Revolut';
UPDATE companies SET rss_url = 'https://medium.com/feed/wise-engineering', site_url = 'https://medium.com/wise-engineering', logo_url = 'https://www.google.com/s2/favicons?domain=wise.com&sz=64' WHERE name_en = 'Wise';
UPDATE companies SET rss_url = NULL, site_url = 'https://www.coinbase.com/blog/landing/engineering', logo_url = 'https://www.google.com/s2/favicons?domain=coinbase.com&sz=64' WHERE name_en = 'Coinbase';
UPDATE companies SET rss_url = NULL, site_url = 'https://www.binance.com/en/blog/tech', logo_url = 'https://www.google.com/s2/favicons?domain=binance.com&sz=64' WHERE name_en = 'Binance';
UPDATE companies SET logo_url = 'https://static.toss.im/ipd-tcs/toss_core/static/v1/Logo.svg'            WHERE name_en = 'Toss';
