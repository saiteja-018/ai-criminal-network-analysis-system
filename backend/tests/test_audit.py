from django.test import TestCase
from apps.accounts.models import User
from apps.audit.models import AuditLog, log_audit_action

class AuditTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='audituser', email='audit@test.com', password='Password@123')

    def test_log_audit_action(self):
        log_audit_action(
            user=self.user,
            action='TEST_ACTION',
            resource_type='TestResource',
            resource_id='100',
            metadata={'password': 'secret_password', 'detail': 'normal data'}
        )

        logs = AuditLog.objects.filter(action='TEST_ACTION')
        self.assertEqual(logs.count(), 1)
        log = logs.first()
        self.assertEqual(log.username, 'audituser')
        # Redaction check
        self.assertEqual(log.metadata.get('password'), '***REDACTED***')
        self.assertEqual(log.metadata.get('detail'), 'normal data')
