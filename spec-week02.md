# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2: Author CRUD Operations

### Goal

Store authors separately from books and provide routes to create, read, update, and delete authors. Document every author route in Swagger so it can be tested from the browser.

### Data Model

The `authors` collection stores three required fields.

- `id` is a unique custom string ID, such as `a1`.
- `name` is a string containing the author's name.
- `birthYear` is an integer containing the author's birth year.

The routes use the custom `id`. An author object returned by the API contains `id`, `name`, and `birthYear`.

### Relationship to Books

A book's `authorId` refers to an author's custom `id`. If any book still refers to the author, return `409 Conflict` and keep both the author and the books. The client can reassign or delete the affected books before trying again.

### Routes

#### GET /authors

Return all authors with `200 OK` and an array of author objects. Return `500` for an unexpected server or database error.

#### GET /authors/:id

Return the matching author object with `200 OK`. Return `404` when no author matches the custom ID and `500` for an unexpected server or database error.

#### POST /authors

Create an author from a JSON request body such as the following.

```json
{
  "id": "a1",
  "name": "Maya Rivera",
  "birthYear": 1985
}
```

Return `201 Created` with the newly created author object. Return `400` if a required field is missing or the custom ID already exists. Return `500` for an unexpected server or database error.

#### PUT /authors/:id

Update the author identified by the custom ID in the URL. The JSON request body contains both mutable fields. The ID remains the same.

```json
{
  "name": "Maya L. Rivera",
  "birthYear": 1985
}
```

Return `200 OK` with the updated author object. Return `400` if a required field is missing, `404` if the author does not exist, or `500` for an unexpected server or database error.

#### DELETE /authors/:id

Delete an author with no referencing books. Return `204 No Content` with an empty body. Return `404` if the author does not exist, `409` if a book still references the author, or `500` for an unexpected server or database error.

#### Error responses

| Status | Example JSON response |
| --- | --- |
| `400` | `{"message":"A required field is missing"}` or `{"message":"Author ID already exists"}` |
| `404` | `{"message":"Author not found"}` |
| `409` | `{"message":"Author still has books"}` |
| `500` | `{"message":"Internal server error"}` |

### Swagger Documentation

Document every author route, including its URL parameters, JSON request bodies, and success and error responses.

### Deployment Expectations

The author routes must work locally and on Render. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.

## Version 1 evaluation

1. **Bugs and short-sighted decisions.** Week 01 book documents store an author name, so they need an explicit mapping to author IDs. Two creates can also attempt the same ID at once. An author deletion can race with a book write between the relationship check and the database write.
2. **Security.** Version 1 leaves input types, extra keys, and server error details open. Only accepted fields should reach MongoDB, and clients should receive a generic message on unexpected failures. A public deployment with unauthenticated writes should contain only coursework sample data.
3. **Efficiency.** Both list routes return complete collections. This is suitable for the coursework dataset. The delete guard only needs to find the first referencing book. Indexes can support custom-ID lookups and this guard.
4. **Response clarity.** Version 1 leaves empty lists, malformed requests, some error messages, and response fields implicit. The revised contract should specify these and include both POST and PUT examples in Swagger.

## Version 2 — Implementation checklist

The route paths and success statuses in Version 1 carry forward. The following rules define the request and response contract for both features.

### Shared rules

- [ ] Match URL IDs exactly against the custom `id` field. Return only the documented public fields. Keep MongoDB `_id` internal.
- [ ] Require a JSON object for POST and PUT with all fields listed for that operation. Reject malformed JSON, missing fields, wrong types, and extra keys with `400`. Build database filters and updates from the validated fields.
- [ ] Accept custom IDs as nonempty strings containing letters, digits, hyphens, or underscores. Trim leading and trailing whitespace from names and titles, then require a nonempty value.
- [ ] Use unique indexes on `books.id` and `authors.id` and return `400` on duplicate IDs, including duplicates rejected by MongoDB.
- [ ] Keep PUT as an update of an existing record. Require every mutable field and take the immutable ID from the path. Return `404` for a well-formed update to a missing record.
- [ ] Return `200` with `[]` for an empty collection. Return `204` with zero response body on successful deletion. Use JSON for the other documented responses.
- [ ] Return a JSON `message` string for each error. Log unexpected failures on the server and omit database details, credentials, and stack traces from responses.

### Feature 1 — Books

- [ ] Use `id`, `authorId`, `title`, and `publicationDate` on POST. Use `authorId`, `title`, and `publicationDate` on PUT. Require a real calendar date in `YYYY-MM-DD` format.
- [ ] Populate the `authors` collection before updating Week 01 books. Map each existing author name to a verified author record, preserve the existing book ID, title, and date, and replace the legacy `author` field with `authorId`. Resolve missing or ambiguous author matches before completing the migration. Verify that every book has a valid author reference.
- [ ] On POST and PUT, require the supplied `authorId` to exist. For a well-formed PUT, check for the target book first. Return `400` for an unknown author when the write would otherwise apply.
- [ ] Return books with this shape from GET, POST, and PUT. The list route returns an array of these objects.

```json
{"id":"b4","authorId":"a1","title":"Example Book Title","publicationDate":"2026-01-15"}
```

### Feature 2 — Authors

- [ ] Use `id`, `name`, and `birthYear` on POST. Use `name` and `birthYear` on PUT. Require `birthYear` to be an integer from 1 through the current UTC year.
- [ ] Before deleting an author, confirm the author exists and check for one book referencing their ID. Index `books.authorId` for this lookup. Return `409` while a reference exists. Clients can reassign or delete those books before retrying.
- [ ] For the single-instance coursework deployment, run book creates, book updates, and author deletes one at a time through the same queue. Keep each relationship check and write together. This protects the relationship from overlapping API requests within that instance. Multiple app instances or direct database writers would require coordination at the database level.
- [ ] Return authors with this shape from GET, POST, and PUT. The list route returns an array of these objects.

```json
{"id":"a1","name":"Maya Rivera","birthYear":1985}
```

### Error contract

| Status | Condition | Example JSON body |
| --- | --- | --- |
| `400` | Malformed JSON | `{"message":"Malformed JSON"}` |
| `400` | Missing, invalid, or extra field | `{"message":"birthYear must be an integer from 1 through the current UTC year"}` |
| `400` | Duplicate custom ID | `{"message":"Book ID already exists"}` or `{"message":"Author ID already exists"}` |
| `400` | A book write references an unknown author | `{"message":"Author ID does not exist"}` |
| `404` | Requested record is missing | `{"message":"Book not found"}` or `{"message":"Author not found"}` |
| `409` | A book still references the author being deleted | `{"message":"Author still has books"}` |
| `500` | Unexpected server or database failure | `{"message":"Internal server error"}` |

### Swagger and verification

- [ ] Document all ten book and author routes with path parameters where applicable, request bodies for POST and PUT, and the appropriate success and error responses. Show representative JSON examples and an empty response for `204`.
- [ ] Open Swagger UI at `/api-docs` and try all ten routes locally and on Render. Use temporary coursework records for the write tests.
- [ ] Create an author, create a book referencing that author, read both records, and update both. Try duplicate IDs, missing records, malformed input, and an unknown author ID.
- [ ] Confirm that deleting the referenced author returns `409` and leaves both records intact. Delete or reassign the book, then confirm that deleting the now-unreferenced author returns `204` and a subsequent GET returns `404`.
