# Interaktion med CMS

## Individuellt projektarbete - Book Ducks

```mermaid
erDiagram
    RATING {
        INTEGER id
        INTEGER rating
        STRING book_title
        INTEGER user_id
        INTEGER book_id
    }
    USER {
        INTEGER id
        STRING username
        STRING email
    }
    BOOK {
        INTEGER id
        STRING title
    }

    RATING }o--|| USER : "user"
    RATING }o--|| BOOK : "book"
```
