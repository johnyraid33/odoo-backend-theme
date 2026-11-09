from . import models


def uninstall_hook(env):
    """Remove the customised token file before the module's files disappear.

    The ir.asset "replace" records point at this module's user_variables.scss:
    left behind, they would break every backend bundle after uninstall.
    """
    env['rex.backend.theme']._reset_user_variables()
