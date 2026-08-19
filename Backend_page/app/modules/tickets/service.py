from app.tasks.pdf import generate_pdf_ticket_task

class TicketService:
    @staticmethod
    def generate_ticket(booking_id: int):
        generate_pdf_ticket_task(booking_id)
        return {"status": True, "message": "Ticket generated successfully"}
